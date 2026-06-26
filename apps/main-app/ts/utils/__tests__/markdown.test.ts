import { markdownToPlainText } from "../markdown";

describe("markdownToPlainText", () => {
  const cases: ReadonlyArray<[string, string]> = [
    ["plain text without markdown", "plain text without markdown"],
    ["**bold** and _italic_", "bold and italic"],
    ["# Heading\n\nbody", "Heading body"],
    ["> quoted line", "quoted line"],
    ["see `inline code` here", "see inline code here"],
    ["![alt](img.png) and [label](https://example.com)", "and label"],
    ["<b>hi</b>", "hi"],
    ['Click <a href="https://x">here</a>', "Click here"]
  ];

  test.each(cases)("converts %j to %j", (input, expected) => {
    expect(markdownToPlainText(input)).toBe(expected);
  });

  describe("HTML sanitization", () => {
    const malicious: ReadonlyArray<string> = [
      "<script>alert(1)</script>",
      "<scr<script>ipt>alert(1)",
      "<img src=x onerror=alert(1)>"
    ];

    test.each(malicious)(
      "leaves no residual angle bracket or tag for %j",
      input => {
        const output = markdownToPlainText(input);
        expect(output).not.toMatch(/[<>]/);
        expect(output.toLowerCase()).not.toContain("script");
      }
    );
  });
});
