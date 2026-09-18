import { describe, expect, it } from "vitest";
import { canSkipObserverWait, snapCutoff } from "../src/hooks/compaction-hook.js";
import { OM_OBSERVATIONS_RECORDED, type Entry } from "../src/ledger/index.js";

function user(id: string, text: string): Entry {
	return { type: "message", id, message: { role: "user", content: [{ type: "text", text }] } };
}

describe("snapCutoff", () => {
	it("snaps to an observation chunk boundary", () => {
		const branch: Entry[] = [
			user("u1", "a".repeat(40)),
			{
				type: "custom",
				id: "r1",
				customType: OM_OBSERVATIONS_RECORDED,
				data: {
					observations: [{ timestamp: "t1", content: "kept fact here", tokenCount: 4 }],
					coversUpToId: "u1",
				},
			},
			user("u2", "b".repeat(40)),
		];
		const snap = snapCutoff(branch, "u2", 1);
		expect(snap.firstKeptId).toBe("u2");
		expect(snap.tail).toBeGreaterThan(0);
	});
});

describe("canSkipObserverWait", () => {
	it("waits when an in-flight observer covers before the cutoff", () => {
		const branch: Entry[] = [user("u1", "hello there world"), user("u2", "more text here")];
		expect(canSkipObserverWait(branch, "u2", 1, 100, [{ coversUpToId: "u1" }])).toBe(false);
		expect(canSkipObserverWait(branch, "u2", 1, 100, [])).toBe(true);
	});
});
