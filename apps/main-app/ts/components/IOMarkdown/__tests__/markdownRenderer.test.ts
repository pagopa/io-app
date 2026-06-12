import {
  insertNewLinesIfNeededOnMatch,
  sanitizeMarkdownFromFormFeed
} from "../markdownRenderer";

describe("markdownRenderer", () => {
  describe("sanitizeMarkdownFromFormFeed", () => {
    it("should return an empty string unchanged", () => {
      expect(sanitizeMarkdownFromFormFeed("")).toBe("");
    });

    it("should leave a string without form feed unchanged", () => {
      expect(sanitizeMarkdownFromFormFeed("Hello world")).toBe("Hello world");
    });

    it("should replace a single form feed with a space", () => {
      expect(sanitizeMarkdownFromFormFeed("Hello\fworld")).toBe("Hello world");
    });

    it("should replace multiple form feeds with spaces", () => {
      expect(sanitizeMarkdownFromFormFeed("\fHello\f\fworld\f")).toBe(
        " Hello  world "
      );
    });

    it("should replace a string composed only of form feeds with spaces", () => {
      expect(sanitizeMarkdownFromFormFeed("\f\f\f")).toBe("   ");
    });

    it("should replace form feed inside a URL (side effect: URL becomes invalid)", () => {
      // The regex is global and does NOT skip URLs — \f inside a URL will be
      // replaced with a space. This is intentional: iOS text parser causes a
      // blank page when it encounters \f, so all occurrences must be removed
      // regardless of context.
      expect(
        sanitizeMarkdownFromFormFeed("https://example.com/path\fwith\ffeed")
      ).toBe("https://example.com/path with feed");
    });

    it("should replace form feed in a markdown link URL", () => {
      expect(
        sanitizeMarkdownFromFormFeed("[label](https://example.com/\fpath)")
      ).toBe("[label](https://example.com/ path)");
    });

    it("should replace form feed in markdown link text", () => {
      expect(
        sanitizeMarkdownFromFormFeed("[label\ftext](https://example.com/)")
      ).toBe("[label text](https://example.com/)");
    });

    it("should replace form feed in a markdown image alt text", () => {
      expect(sanitizeMarkdownFromFormFeed("![alt\ftext](image.png)")).toBe(
        "![alt text](image.png)"
      );
    });

    it("should not alter other whitespace characters (\\n, \\t)", () => {
      expect(sanitizeMarkdownFromFormFeed("line1\nline2\ttabbed")).toBe(
        "line1\nline2\ttabbed"
      );
    });
  });
  describe("insertNewLinesIfNeededOnMatch", () => {
    it("Given two new lines before and after, should do nothing", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n![](anImage)\n\n",
        match
      );
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given one new line before and two after, should add one new line before", () => {
      const match = { index: 1, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n![](anImage)\n\n", match);
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given no new line before and two after, should add two new lines before", () => {
      const match = { index: 0, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("![](anImage)\n\n", match);
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given two new lines before and one after, should add one new line after", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n\n![](anImage)\n", match);
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given two new lines before and no one after, should add two new lines after", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n\n![](anImage)", match);
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given no new line before nor after, should add two new lines before and after", () => {
      const match = { index: 0, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("![](anImage)", match);
      expect(output).toBe("\n\n![](anImage)\n\n");
    });
    it("Given one new line before and two after, with spaces, should add one new line before and one after", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n ![](anImage) \n", match);
      expect(output).toBe("\n \n![](anImage)\n \n");
    });
    it("Given two new lines before and two after, with spaces, should do nothing", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n ![](anImage) \n\n",
        match
      );
      expect(output).toBe("\n\n ![](anImage) \n\n");
    });
    it("Given two new lines before and one after, with spaces, should add one new line after", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n ![](anImage) \n",
        match
      );
      expect(output).toBe("\n\n ![](anImage)\n \n");
    });
    it("Given two new line before and no one after, with spaces, should add two new lines after", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n\n ![](anImage) ", match);
      expect(output).toBe("\n\n ![](anImage)\n\n ");
    });
    it("Given one new line before and two after, with spaces, should add one new line before", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n ![](anImage) \n\n",
        match
      );
      expect(output).toBe("\n \n![](anImage) \n\n");
    });
    it("Given no new line before and two after, with spaces, should add two new lines before", () => {
      const match = { index: 1, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(" ![](anImage) \n\n", match);
      expect(output).toBe(" \n\n![](anImage) \n\n");
    });
    it("Given no new line before nor after, with spaces, should add two new lines before and after", () => {
      const match = { index: 1, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(" ![](anImage) ", match);
      expect(output).toBe(" \n\n![](anImage)\n\n ");
    });

    it("Given three new lines before and three after, should do nothing", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n\n![](anImage)\n\n\n",
        match
      );
      expect(output).toBe("\n\n\n![](anImage)\n\n\n");
    });
    it("Given three new lines before and one after, should add one new line after", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n\n![](anImage)\n",
        match
      );
      expect(output).toBe("\n\n\n![](anImage)\n\n");
    });
    it("Given three new line before and no one after, should add two new lines after", () => {
      const match = { index: 3, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("\n\n\n![](anImage)", match);
      expect(output).toBe("\n\n\n![](anImage)\n\n");
    });
    it("Given one new line before and three after, should add one new line before", () => {
      const match = { index: 1, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage)\n\n\n",
        match
      );
      expect(output).toBe("\n\n![](anImage)\n\n\n");
    });
    it("Given no new line before and three after, should add two new lines before", () => {
      const match = { index: 0, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch("![](anImage)\n\n\n", match);
      expect(output).toBe("\n\n![](anImage)\n\n\n");
    });

    it("Given three new lines before and three after, with spaces, should do nothing", () => {
      const match = { index: 4, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n\n ![](anImage) \n\n\n",
        match
      );
      expect(output).toBe("\n\n\n ![](anImage) \n\n\n");
    });
    it("Given three new lines before and one after, with spaces, should add one new line after", () => {
      const match = { index: 4, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n\n ![](anImage) \n",
        match
      );
      expect(output).toBe("\n\n\n ![](anImage)\n \n");
    });
    it("Given three new line before and no one after, with spaces, should add two new lines after", () => {
      const match = { index: 4, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n\n\n ![](anImage) ",
        match
      );
      expect(output).toBe("\n\n\n ![](anImage)\n\n ");
    });
    it("Given one new line before and three after, with spaces, should add one new line before", () => {
      const match = { index: 2, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n ![](anImage) \n\n\n",
        match
      );
      expect(output).toBe("\n \n![](anImage) \n\n\n");
    });
    it("Given no new line before and three after, with spaces, should add two new lines before", () => {
      const match = { index: 1, [0]: { length: 12 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " ![](anImage) \n\n\n",
        match
      );
      expect(output).toBe(" \n\n![](anImage) \n\n\n");
    });

    it("should work around the second match, with two matches, no new lines", () => {
      const match = { index: 14, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) ![](anImage2)",
        match
      );
      expect(output).toBe("![](anImage1) \n\n![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, one ending new line", () => {
      const match = { index: 14, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) ![](anImage2)\n",
        match
      );
      expect(output).toBe("![](anImage1) \n\n![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, two ending new lines", () => {
      const match = { index: 14, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("![](anImage1) \n\n![](anImage2) \n \n");
    });

    it("should work around the second match, with two matches, one starting new line, no ending new line", () => {
      const match = { index: 16, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2)",
        match
      );
      expect(output).toBe("![](anImage1) \n \n![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, one starting new line, one ending new line", () => {
      const match = { index: 16, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("![](anImage1) \n \n![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, one starting new line, two ending new lines", () => {
      const match = { index: 16, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("![](anImage1) \n \n![](anImage2) \n \n");
    });

    it("should work around the second match, with two matches, two starting new lines, no ending new line", () => {
      const match = { index: 17, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2)",
        match
      );
      expect(output).toBe("![](anImage1)\n \n ![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, two starting new lines, one ending new line", () => {
      const match = { index: 17, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("![](anImage1)\n \n ![](anImage2)\n\n");
    });
    it("should work around the second match, with two matches, two starting new lines, two ending new lines", () => {
      const match = { index: 17, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, one middle new line, no ending new line", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2)",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, one middle new line, one ending new line", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, one middle new line, two ending new lines", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1) \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, two middle new lines, no ending new line", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2)",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, two middle new lines, one ending new line", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, two middle new lines, two ending new lines", () => {
      const match = { index: 0, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "![](anImage1)\n \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, one starting new line, one middle new line, no ending new line", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1) \n ![](anImage2)",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, one starting new line, one middle new line, one ending new line", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1) \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, one starting new line, one middle new line, two ending new lines", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1) \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, one starting new line, two middle new lines, no ending new line", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1)\n \n ![](anImage2)",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, one starting new line, two middle new lines, one ending new line", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1)\n \n ![](anImage2)\n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, one starting new line, two middle new lines, two ending new lines", () => {
      const match = { index: 1, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        "\n![](anImage1)\n \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe("\n\n![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, two starting new lines, one middle new line, no ending new line", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1) \n ![](anImage2)",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, two starting new lines, one middle new line, one ending new line", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1) \n ![](anImage2)\n",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, two starting new lines, one middle new line, two ending new lines", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1) \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2) \n \n");
    });

    it("should work around the first match, with two matches, two starting new lines, two middle new lines, no ending new line", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1)\n \n ![](anImage2)",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2)");
    });
    it("should work around the first match, with two matches, two starting new lines, two middle new lines, one ending new line", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1)\n \n ![](anImage2)\n",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2)\n");
    });
    it("should work around the first match, with two matches, two starting new lines, two middle new lines, two ending new lines", () => {
      const match = { index: 5, [0]: { length: 13 } } as RegExpExecArray;
      const output = insertNewLinesIfNeededOnMatch(
        " \n \n ![](anImage1)\n \n ![](anImage2) \n \n",
        match
      );
      expect(output).toBe(" \n \n ![](anImage1)\n \n ![](anImage2) \n \n");
    });
  });
});
