import { describe, expect, it } from "vitest";
import {
	OM_OBSERVATIONS_RECORDED,
	isValidCutPoint,
	latestCoverageMarkerId,
	selectSourceSlice,
	type Entry,
} from "../src/ledger/index.js";

function user(id: string, text: string): Entry {
	return {
		type: "message",
		id,
		message: { role: "user", content: [{ type: "text", text }], timestamp: 1 },
	};
}

function assistant(id: string, text: string): Entry {
	return {
		type: "message",
		id,
		message: { role: "assistant", content: [{ type: "text", text }], timestamp: 1 },
	};
}

function toolResult(id: string, text: string): Entry {
	return {
		type: "message",
		id,
		message: { role: "tool", toolName: "bash", content: [{ type: "text", text }], timestamp: 1 },
	};
}

describe("selectSourceSlice", () => {
	it("does not cut between an assistant tool call and its result", () => {
		const branch: Entry[] = [
			user("u1", "a".repeat(80)),
			assistant("a1", "b".repeat(80)),
			toolResult("t1", "c".repeat(80)),
			user("u2", "d".repeat(80)),
		];
		expect(isValidCutPoint(toolResult("t1", "x"))).toBe(false);
		const slice = selectSourceSlice(branch, undefined, 45);
		expect(slice.coversUpToId).toBe("t1");
		expect(slice.entries.map((e) => e.id)).toEqual(["u1", "a1", "t1"]);
	});

	it("advances coverage from empty recorded watermarks", () => {
		const branch: Entry[] = [
			user("u1", "hello there this is a user turn"),
			{
				type: "custom",
				id: "r1",
				customType: OM_OBSERVATIONS_RECORDED,
				data: { observations: [], coversUpToId: "u1" },
			},
			user("u2", "another user turn with enough text"),
		];
		expect(latestCoverageMarkerId(branch, OM_OBSERVATIONS_RECORDED)).toBe("u1");
		const slice = selectSourceSlice(branch, "u1", 10_000);
		expect(slice.coversUpToId).toBe("u2");
	});
});
