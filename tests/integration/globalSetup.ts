import { execSync } from "node:child_process";
import type { TestProject } from "vitest/node";

export interface SupabaseTestEnv {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

declare module "vitest" {
  export interface ProvidedContext {
    supabase: SupabaseTestEnv;
  }
}

function readLocalStatus(): SupabaseTestEnv {
  let raw: string;
  try {
    raw = execSync("npx supabase status -o json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    throw new Error(
      "Local Supabase is not running. Start it with `npm run db:start` (requires Docker), " +
        "or set SUPABASE_TEST_URL / SUPABASE_TEST_ANON_KEY / SUPABASE_TEST_SERVICE_ROLE_KEY."
    );
  }
  // ה-CLI עלול להדפיס שורות לפני ה-JSON
  const json = JSON.parse(raw.slice(raw.indexOf("{")));
  return { url: json.API_URL, anonKey: json.ANON_KEY, serviceRoleKey: json.SERVICE_ROLE_KEY };
}

export default function setup(project: TestProject) {
  const env: SupabaseTestEnv =
    process.env.SUPABASE_TEST_URL &&
    process.env.SUPABASE_TEST_ANON_KEY &&
    process.env.SUPABASE_TEST_SERVICE_ROLE_KEY
      ? {
          url: process.env.SUPABASE_TEST_URL,
          anonKey: process.env.SUPABASE_TEST_ANON_KEY,
          serviceRoleKey: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY,
        }
      : readLocalStatus();

  // הבדיקות יוצרות ומוחקות משתמשים עם service role — לעולם לא מול פרויקט אמיתי.
  const host = new URL(env.url).hostname;
  if (!["127.0.0.1", "localhost", "host.docker.internal"].includes(host)) {
    throw new Error(`Refusing to run integration tests against non-local Supabase (${host}).`);
  }

  project.provide("supabase", env);
}
