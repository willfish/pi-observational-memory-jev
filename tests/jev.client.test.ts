import { describe, expect, it } from "vitest";
import { buildJevRequest, parseJevResponse } from "../src/jev/client.js";

describe("Jev HTTP helpers", () => {
	it("builds a System One request", () => {
		const request = buildJevRequest(
			{ apiKey: "secret", model: "jev-latest" },
			{ chunk: "hello" },
			{ keep_c1: { type: "noul", instructions: "keep?" } },
		);
		expect(request.url).toBe("https://api.typesafe.ai/v1/systemone");
		expect(request.headers.authorization).toBe("Bearer secret");
		const body = JSON.parse(request.body) as { model: string; state: unknown };
		expect(body.model).toBe("jev-latest");
		expect(body.state).toEqual({ chunk: "hello" });
	});

	it("rejects missing answers", () => {
		expect(() => parseJevResponse(200, true, "{}")).toThrow(/missing answers/);
		expect(() => parseJevResponse(401, false, "nope")).toThrow(/401/);
	});
});
