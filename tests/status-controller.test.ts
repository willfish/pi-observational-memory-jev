import { describe, expect, it } from "vitest";
import { StatusController } from "../src/ui/status-controller.js";

describe("StatusController", () => {
	it("renders footer gauges when attached", () => {
		const controller = new StatusController({ settleMs: 10, spinnerIntervalMs: 10_000 });
		let status: string | undefined;
		controller.attach({
			setStatus: (_key, text) => {
				status = text;
			},
			setWidget: () => undefined,
			theme: { fg: (_color, text) => text },
		});
		controller.setGauges({
			nextValue: 10,
			nextMax: 100,
			poolValue: 20,
			poolMax: 100,
			ctxValue: 30,
			ctxMax: 100,
		});
		expect(status).toContain("O");
		expect(status).toContain("C");
		expect(status).toContain("X");
		controller.detach();
		expect(status).toBeUndefined();
	});
});
