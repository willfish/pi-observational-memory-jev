import { describe, expect, it } from "vitest";
import {
	formatFooterSpend,
	formatObserverResultToast,
	formatStatusSpend,
	isPiCompactTooSmall,
	shouldAttachOmStatus,
} from "../src/spend.js";
import { formatSmallSessionCompact } from "../src/commands/compact.js";

describe("spend formatting", () => {
	it("shows request and token spend instead of zero dollars", () => {
		const spend = { costUsd: 0, runs: 2, requests: 2, inputTokens: 1200, outputTokens: 34 };
		expect(formatStatusSpend(spend)).toBe("2 jev requests, 1,234 tok");
		expect(formatFooterSpend(spend)).toBe("2j 1.2k");
		expect(formatStatusSpend({ costUsd: 0, runs: 0, requests: 0, inputTokens: 0, outputTokens: 0 })).toBe("none yet");
	});

	it("keeps a dollar figure when one is recorded", () => {
		expect(
			formatFooterSpend({ costUsd: 0.012, runs: 1, requests: 1, inputTokens: 10, outputTokens: 2 }),
		).toBe("$0.012");
	});
});

describe("observer toast", () => {
	it("says covered when a chunk produced no keeps", () => {
		expect(formatObserverResultToast({ kept: 0, rejected: 4, tokens: 584 })).toBe(
			"om: observer covered ~584 tok, kept 0",
		);
		expect(formatObserverResultToast({ kept: 3, rejected: 1, tokens: 200 })).toBe("om: observer +3 (~200 tok)");
	});
});

describe("compact fallback", () => {
	it("treats Pi small-session errors as an om ledger render", () => {
		expect(isPiCompactTooSmall("Nothing to compact (session too small)")).toBe(true);
		expect(formatSmallSessionCompact(undefined)).toBe("om: nothing to compact (empty ledger)");
		expect(formatSmallSessionCompact("## Journey\n- fact")).toContain("session too small to cut");
		expect(formatSmallSessionCompact("## Journey\n- fact")).toContain("## Journey");
	});
});

describe("status attach", () => {
	it("attaches whenever the host has a UI, including RPC", () => {
		expect(shouldAttachOmStatus({ hasUI: true, ui: {} })).toBe(true);
		expect(shouldAttachOmStatus({ hasUI: true, ui: { notify() {} } })).toBe(true);
		expect(shouldAttachOmStatus({ hasUI: false })).toBe(false);
		expect(shouldAttachOmStatus({ hasUI: false, ui: undefined })).toBe(false);
	});
});
