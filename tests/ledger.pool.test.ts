import { describe, expect, it } from "vitest";
import { poolTokens, selectPromotionOverflow } from "../src/ledger/pool.js";
import type { Observation } from "../src/ledger/types.js";

function obs(timestamp: string, tokenCount: number): Observation {
	return { timestamp, content: `c-${timestamp}`, tokenCount };
}

describe("selectPromotionOverflow", () => {
	it("promotes oldest observations above the target and keeps at least the newest", () => {
		const active = [obs("2026-01-01T00:00:00", 5), obs("2026-01-01T00:00:01", 5), obs("2026-01-01T00:00:02", 5)];
		const { promote, keptTokens, totalTokens } = selectPromotionOverflow(active, 6);
		expect(promote.map((o) => o.timestamp)).toEqual(["2026-01-01T00:00:00", "2026-01-01T00:00:01"]);
		expect(keptTokens).toBe(5);
		expect(totalTokens).toBe(15);
		expect(poolTokens(active)).toBe(15);
	});
});
