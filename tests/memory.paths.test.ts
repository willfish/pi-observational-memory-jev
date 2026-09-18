import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderIndexFile, renderMemoryMap } from "../src/memory/index-render.js";
import { atomicWrite, listTopics, parseFrontMatter, resolveWithinMemory } from "../src/memory/paths.js";

describe("memory paths", () => {
	it("parses front matter and lists topics excluding INDEX and JOURNEY", () => {
		const root = mkdtempSync(join(tmpdir(), "omj-mem-"));
		atomicWrite(
			join(root, "decisions.md"),
			"---\nid: decisions\ntitle: Decisions\nsummary: use Jev\nupdated: 2026-01-01\n---\n\n- keep verbatim\n",
		);
		atomicWrite(join(root, "INDEX.md"), "# ignore\n");
		atomicWrite(join(root, "JOURNEY.md"), "## day\n");
		const topics = listTopics(root);
		expect(topics.map((t) => t.filename)).toEqual(["decisions.md"]);
		expect(topics[0].title).toBe("Decisions");
		expect(renderMemoryMap(topics)).toContain("use Jev");
		expect(renderIndexFile(topics)).toContain("Decisions");
		expect(parseFrontMatter(topics[0].body).front.id).toBeUndefined();
	});

	it("rejects paths that escape the session memory root", () => {
		const root = mkdtempSync(join(tmpdir(), "omj-mem-"));
		expect(resolveWithinMemory(root, "../outside.md")).toBeUndefined();
		expect(resolveWithinMemory(root, "decisions.md")?.endsWith("decisions.md")).toBe(true);
	});
});
