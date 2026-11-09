import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        // בדיקות יחידה + UI — לא דורשות בסיס נתונים
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "tests/ui/**/*.test.tsx", "tests/unit/**/*.test.ts"],
          setupFiles: ["tests/setup/jest-dom.ts"],
        },
      },
      {
        // בדיקות אינטגרציה מול Supabase מקומי אמיתי (npm run db:start)
        resolve: { alias },
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["tests/integration/globalSetup.ts"],
          testTimeout: 30_000,
          hookTimeout: 60_000,
          // קבצים רצים אחד אחרי השני — פחות עומס על ה-Auth המקומי
          fileParallelism: false,
        },
      },
    ],
  },
});
