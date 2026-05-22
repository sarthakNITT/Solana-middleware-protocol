import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("examples", () => {
  const exampleProjects = [
    "basic-transfer",
    "mainnet-config",
    "custom-rpc",
    "logger-usage",
    "failure-recovery",
  ];

  it.each(exampleProjects)("documents and packages %s", async (project) => {
    const root = join(process.cwd(), "examples", project);
    const readme = await readFile(join(root, "README.md"), "utf8");
    const env = await readFile(join(root, ".env.example"), "utf8");
    const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
    };
    const source = await readFile(join(root, "src", "index.ts"), "utf8");

    expect(readme).toContain("Install");
    expect(readme).toContain("Run");
    expect(env).toMatch(/SENDRA_(DEVNET|MAINNET)_URL_1/);
    expect(packageJson.scripts.dev).toBe("tsx src/index.ts");
    expect(packageJson.dependencies["sendra-tx"]).toBeDefined();
    expect(source).toContain("SendWithReliability");
    expect(source).toContain('await import("sendra-tx")');
  });
});
