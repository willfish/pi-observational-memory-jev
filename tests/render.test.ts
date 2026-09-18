import { describe, expect, it } from "vitest";
import { renderSummary } from "../src/ledger/render.js";

describe("renderSummary", () => {
	it("returns empty when there is nothing to inject", () => {
		expect(renderSummary(undefined, undefined, [])).toBe("");
	});

	it("renders journey, map and kind-tagged observations in order", () => {
		const text = renderSummary(
			"Started the work.",
			"## Memory map\n- `.memory/x/decisions.md` — use Jev",
			[
				{ timestamp: "2026-01-01T00:00:01", content: "later", tokenCount: 1, kind: "fact" },
				{ timestamp: "2026-01-01T00:00:00", content: "earlier", tokenCount: 1, kind: "decision" },
			],
		);
		expect(text).toContain("## Journey");
		expect(text).toContain("Started the work.");
		expect(text).toContain("## Memory map");
		expect(text.indexOf("earlier")).toBeLessThan(text.indexOf("later"));
		expect(text).toContain("[decision] earlier");
		expect(text).toContain("was not rewritten");
	});
});
