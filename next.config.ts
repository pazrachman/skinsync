import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md / CLAUDE.md when `next dev` detects an AI agent.
  agentRules: false,
};

export default nextConfig;
