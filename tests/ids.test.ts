import { describe, expect, it } from "vitest";
import { assignObservationTimestamps } from "../src/ids.js";

describe("assignObservationTimestamps", () => {
	it("disambiguates collisions and copies Jev fields", () => {
		const result = assignObservationTimestamps(
			[
				{ timestamp: "2026-01-01 00:00", content: "one", kind: "decision", keep: 0.9, sourceEntryId: "m1" },
				{ timestamp: "2026-01-01 00:00", content: "two", kind: "constraint", keep: 0.8 },
			],
			{ used: ["2026-01-01T00:00:00"] },
		);
		expect(result[0].timestamp).toBe("2026-01-01T00:00:00.01");
		expect(result[1].timestamp).toBe("2026-01-01T00:00:00.02");
		expect(result[0].kind).toBe("decision");
		expect(result[0].keep).toBe(0.9);
		expect(result[0].content).toBe("one");
		expect(result.every((o) => o.tokenCount > 0)).toBe(true);
	});
});
