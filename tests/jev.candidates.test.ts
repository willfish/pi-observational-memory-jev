import { describe, expect, it } from "vitest";
import { extractCandidates } from "../src/jev/candidates.js";

describe("extractCandidates", () => {
	it("splits source entries into labelled verbatim excerpts", () => {
		const candidates = extractCandidates(
			[
				{
					type: "message",
					id: "m1",
					message: {
						role: "user",
						timestamp: "2026-01-01T12:00:00",
						content: [{ type: "text", text: "Never edit src/generated. Fix the failing test instead." }],
					},
				},
			],
			32,
		);
		expect(candidates.length).toBeGreaterThan(0);
		expect(candidates[0].sourceEntryId).toBe("m1");
		expect(candidates.some((c) => c.text.includes("Never edit src/generated"))).toBe(true);
		expect(candidates.every((c) => !c.text.includes("\n"))).toBe(true);
	});

	it("scores duplicate text once", () => {
		const text = "The production database host is db-prod-7.internal. The production database host is db-prod-7.internal.";
		const candidates = extractCandidates(
			[
				{
					type: "message",
					id: "m1",
					message: { role: "user", content: [{ type: "text", text }] },
				},
				{
					type: "message",
					id: "m2",
					message: { role: "user", content: [{ type: "text", text }] },
				},
			],
			32,
		);
		expect(candidates).toHaveLength(1);
		expect(candidates[0].text).toContain("db-prod-7.internal");
	});

	it("caps candidate count", () => {
		const text = Array.from({ length: 20 }, (_, i) => `This is candidate sentence number ${i} about the work.`).join(
			" ",
		);
		const candidates = extractCandidates(
			[{ type: "message", id: "m1", message: { role: "user", content: [{ type: "text", text }] } }],
			3,
		);
		expect(candidates).toHaveLength(3);
	});
});
