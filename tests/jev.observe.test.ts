import { describe, expect, it } from "vitest";
import { observeChunk } from "../src/jev/observe.js";
import type { JevAsker, JevQuestions, JevResponse } from "../src/jev/types.js";

function fakeAsker(handler: (questions: JevQuestions) => JevResponse): JevAsker {
	return {
		async ask(_state, questions) {
			return handler(questions);
		},
	};
}

describe("observeChunk", () => {
	it("keeps verbatim text only when Jev keep is above threshold", async () => {
		const asker = fakeAsker((questions) => {
			const answers: JevResponse["answers"] = {};
			for (const name of Object.keys(questions)) {
				if (name.startsWith("keep_")) {
					answers[name] = { noul: name.includes("c1") ? 0.9 : 0.1 };
				} else {
					answers[name] = { choice: "constraint", confidence: 0.8 };
				}
			}
			return { answers };
		});
		const result = await observeChunk(
			"chunk",
			[
				{ id: "c1", sourceEntryId: "m1", timestamp: "2026-01-01 00:00", text: "Never edit src/generated." },
				{ id: "c2", sourceEntryId: "m2", timestamp: "2026-01-01 00:01", text: "Read a file for no reason." },
			],
			asker,
			{ keepThreshold: 0.5, maxStateTokens: 25_000, maxRequestTokens: 30_000 },
		);
		expect(result.accepted).toHaveLength(1);
		expect(result.accepted[0].content).toBe("Never edit src/generated.");
		expect(result.accepted[0].kind).toBe("constraint");
		expect(result.rejected).toBe(1);
		expect(result.requests).toBe(1);
		expect(result.inputTokens).toBe(0);
		expect(result.outputTokens).toBe(0);
	});

	it("sums Jev usage tokens", async () => {
		const result = await observeChunk(
			"chunk",
			[{ id: "c1", sourceEntryId: "m1", timestamp: "t", text: "Never edit src/generated." }],
			fakeAsker(() => ({
				answers: {
					keep_c1: { noul: 0.9 },
					kind_c1: { choice: "constraint", confidence: 0.8 },
				},
				usage: { input_tokens: 80, output_tokens: 12 },
			})),
			{ keepThreshold: 0.5, maxStateTokens: 25_000, maxRequestTokens: 30_000 },
		);
		expect(result.inputTokens).toBe(80);
		expect(result.outputTokens).toBe(12);
	});

	it("returns nothing when there are no candidates", async () => {
		const result = await observeChunk("chunk", [], fakeAsker(() => ({ answers: {} })), {
			keepThreshold: 0.5,
			maxStateTokens: 100,
			maxRequestTokens: 100,
		});
		expect(result).toEqual({ accepted: [], rejected: 0, requests: 0, inputTokens: 0, outputTokens: 0 });
	});
});
