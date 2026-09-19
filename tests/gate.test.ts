import { describe, expect, it } from "vitest";
import { initialOmEnabled, readEnabledFromLedger } from "../src/gate.js";
import { OM_ENABLED, type Entry } from "../src/ledger/index.js";

function gate(enabled: boolean): Entry {
	return { type: "custom", id: enabled ? "on" : "off", customType: OM_ENABLED, data: { enabled } };
}

describe("om enable gate", () => {
	it("uses the package default when the ledger has no gate", () => {
		expect(readEnabledFromLedger([])).toBeUndefined();
		expect(initialOmEnabled([], false)).toBe(false);
		expect(initialOmEnabled([], true)).toBe(true);
	});

	it("honours an explicit ledger gate over the default", () => {
		expect(initialOmEnabled([gate(false)], true)).toBe(false);
		expect(initialOmEnabled([gate(true)], false)).toBe(true);
		expect(readEnabledFromLedger([gate(true), gate(false)])).toBe(false);
	});
});
