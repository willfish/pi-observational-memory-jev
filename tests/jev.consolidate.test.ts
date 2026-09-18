import { describe, expect, it } from "vitest";
import { appendJourney, consolidateOverflow, trimJourney } from "../src/jev/consolidate.js";
import type { Observation } from "../src/ledger/types.js";
import type { JevAsker } from "../src/jev/types.js";

function obs(timestamp: string, content: string, kind: Observation["kind"]): Observation {
	return { timestamp, content, tokenCount: 4, kind };
}

describe("consolidateOverflow", () => {
	it("writes kind files for durable observations and tombstones the whole batch after success", async () => {
		const asker: JevAsker = {
			async ask() {
				return {
					answers: {
						"durable_2026-01-01T00:00:00": { noul: 0.9 },
						"durable_2026-01-01T00:00:01": { noul: 0.1 },
					},
				};
			},
		};
		const promote = [
			obs("2026-01-01T00:00:00", "Never edit src/generated.", "constraint"),
			obs("2026-01-01T00:00:01", "Opened a scratch file.", "fact"),
		];
		const result = await consolidateOverflow(promote, {}, undefined, asker, {
			keepThreshold: 0.5,
			journeyTargetTokens: 1000,
			updated: "2026-01-01 00:02",
		});
		expect(result.writes).toHaveLength(1);
		expect(result.writes[0].filename).toBe("constraints.md");
		expect(result.writes[0].body).toContain("Never edit src/generated.");
		expect(result.writes[0].body).not.toContain("scratch file");
		expect(result.droppedTimestamps).toEqual(["2026-01-01T00:00:00", "2026-01-01T00:00:01"]);
		expect(result.journey).toContain("Never edit src/generated.");
		expect(result.requests).toBe(1);
	});

	it("does not tombstone when Jev fails", async () => {
		const asker: JevAsker = {
			async ask() {
				throw new Error("TYPESAFE_API_KEY is not configured");
			},
		};
		await expect(
			consolidateOverflow([obs("t1", "hello there world", "fact")], {}, undefined, asker, {
				keepThreshold: 0.5,
				journeyTargetTokens: 100,
				updated: "now",
			}),
		).rejects.toThrow(/TYPESAFE_API_KEY/);
	});
});

describe("trimJourney", () => {
	it("drops oldest sections to fit the token budget", () => {
		const journey = appendJourney(appendJourney(undefined, [obs("a", "x".repeat(80), "fact")], "day-1"), [
			obs("b", "y".repeat(80), "fact"),
		], "day-2");
		const trimmed = trimJourney(journey, 40);
		expect(trimmed).toContain("day-2");
		expect(trimmed).not.toContain("day-1");
	});
});
