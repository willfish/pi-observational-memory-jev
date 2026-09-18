import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig, readEnvConfig } from "../src/config.js";

describe("loadConfig", () => {
	it("reads observational-memory-jev from project settings", () => {
		const cwd = mkdtempSync(join(tmpdir(), "omj-"));
		mkdirSync(join(cwd, ".pi"));
		writeFileSync(
			join(cwd, ".pi", "settings.json"),
			JSON.stringify({
				"observational-memory-jev": {
					chunkTokens: 1234,
					jev: { keepThreshold: 0.7, model: "jev-latest" },
				},
			}),
		);
		const config = loadConfig(cwd, {});
		expect(config.chunkTokens).toBe(1234);
		expect(config.jev.keepThreshold).toBe(0.7);
		expect(config.jev.baseUrl).toContain("typesafe.ai");
	});

	it("honours PI_OM_PASSIVE", () => {
		expect(readEnvConfig({ PI_OM_PASSIVE: "1" }).passive).toBe(true);
		expect(readEnvConfig({ PI_OM_PASSIVE: "0" }).passive).toBe(false);
	});
});
