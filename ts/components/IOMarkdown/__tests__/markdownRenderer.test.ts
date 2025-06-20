import { sanitizeMarkdownNewlines } from "../markdownRenderer";

describe("sanitizeMarkdownNewlines", () => {
  it("should preserve line breaks (two spaces followed by a newline)", () => {
    const input = "This is a line.  \nThis is another line.";
    const expected = "This is a line.  \nThis is another line.";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should preserve paragraph breaks (two newlines)", () => {
    const input = "This is a paragraph.\n\nThis is another paragraph.";
    const expected = "This is a paragraph.\n\nThis is another paragraph.";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should replace a single newline with a space", () => {
    const input = "Line one\nLine two";
    const expected = "Line one Line two";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should replace a single newline with a leading space with a space", () => {
    const input = "Line one \nLine two";
    const expected = "Line one Line two";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should replace a single newline with leading and trailing spaces with a space", () => {
    const input = "Line one \n Line two";
    const expected = "Line one Line two";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle mixed newline types correctly", () => {
    const input = "Paragraph 1.\n\nParagraph 2.  \nStill P2.\nParagraph 3.";
    const expected = "Paragraph 1.\n\nParagraph 2.  \nStill P2. Paragraph 3.";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle multiple single newlines to be replaced", () => {
    const input = "word1\nword2\nword3";
    const expected = "word1 word2 word3";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle newlines at the beginning of the string", () => {
    const input = "\nStart of text";
    const expected = " Start of text";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle newlines at the end of the string", () => {
    const input = "End of text\n";
    const expected = "End of text ";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle multiple preserved newlines", () => {
    const input = "Text1  \nText2\n\nText3  \nText4";
    const expected = "Text1  \nText2\n\nText3  \nText4";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should return an empty string if input is empty", () => {
    const input = "";
    const expected = "";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should return the same string if no newlines are present", () => {
    const input = "This is a simple string without newlines.";
    const expected = "This is a simple string without newlines.";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should correctly handle a complex case with various newline combinations", () => {
    const input =
      "First line.  \nSecond line (line break).\n\nThird line (paragraph break).\nFourth line (single newline).\n Fifth line (space then newline). \n Sixth line (space, newline, space).  \nSeventh line.";
    const expected =
      "First line.  \nSecond line (line break).\n\nThird line (paragraph break). Fourth line (single newline). Fifth line (space then newline). Sixth line (space, newline, space).  \nSeventh line.";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });

  it("should handle only spaces and newlines", () => {
    const input = " \n \n  \n\n \n ";
    // " \n " -> " "
    // "\n" -> " "
    // "  \n" -> "___LINEBREAK_MARKER___"
    // "\n\n" -> "___PARAGRAPHBREAK_MARKER___"
    // " \n " -> " "
    const expected = "   \n\n ";
    expect(sanitizeMarkdownNewlines(input)).toBe(expected);
  });
});
