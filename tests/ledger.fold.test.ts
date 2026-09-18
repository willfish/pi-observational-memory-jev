import { describe, expect, it } from "vitest";
import { foldLedger } from "../src/ledger/fold.js";
import { OM_OBSERVATIONS_DROPPED, OM_OBSERVATIONS_RECORDED, type Entry, type Observation } from "../src/ledger/types.js";

function obs(timestamp: string, content = "hello world"): Observation {
	return { timestamp, content, tokenCount: 3 };
}

function recorded(id: string, coversUpToId: string, observations: Observation[]): Entry {
	return { type: "custom", id, customType: OM_OBSERVATIONS_RECORDED, data: { observations, coversUpToId } };
}

function dropped(id: string, coversUpToId: string, observationTimestamps: string[]): Entry {
	return { type: "custom", id, customType: OM_OBSERVATIONS_DROPPED, data: { observationTimestamps, coversUpToId } };
}

describe("foldLedger", () => {
	it("keeps first-valid observations and applies tombstones on the branch", () => {
		const branch: Entry[] = [
			{ type: "message", id: "m1" },
			recorded("r1", "m1", [obs("2026-01-01T00:00:00", "first"), obs("2026-01-01T00:00:01", "second")]),
			dropped("d1", "m1", ["2026-01-01T00:00:00"]),
			recorded("r2", "m1", [obs("2026-01-01T00:00:00", "should not win")]),
		];
		const folded = foldLedger(branch);
		expect(folded.activeObservations.map((o) => o.content)).toEqual(["second"]);
		expect(folded.observationsByTimestamp.get("2026-01-01T00:00:00")?.content).toBe("first");
	});

	it("rolls back when folding to an earlier entry", () => {
		const branch: Entry[] = [
			{ type: "message", id: "m1" },
			recorded("r1", "m1", [obs("t1")]),
			{ type: "message", id: "m2" },
			recorded("r2", "m2", [obs("t2")]),
		];
		expect(foldLedger(branch, { upToEntryId: "r1" }).activeObservations.map((o) => o.timestamp)).toEqual(["t1"]);
		expect(foldLedger(branch).activeObservations.map((o) => o.timestamp)).toEqual(["t1", "t2"]);
	});
});
