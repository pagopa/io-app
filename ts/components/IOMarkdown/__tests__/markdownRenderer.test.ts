import { insertNewLinesIfNeededOnMatch } from "../markdownRenderer";

describe("markdownRenderer", () => {
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
  });
});
