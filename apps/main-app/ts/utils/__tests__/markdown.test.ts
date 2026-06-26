import { markdownToPlainText } from "../markdown";

describe("markdownToPlainText", () => {
  const cases: ReadonlyArray<[string, string]> = [
    ["plain text without markdown", "plain text without markdown"],
    ["**bold** and _italic_", "bold and italic"],
    ["# Heading\n\nbody", "Heading body"],
    ["> quoted line", "quoted line"],
    ["see `inline code` here", "see inline code here"],
    ["![alt](img.png) and [label](https://example.com)", "and label"]
  ];

  test.each(cases)("converts %j to %j", (input, expected) => {
    expect(markdownToPlainText(input)).toBe(expected);
  });

  describe("HTML sanitization", () => {
    // The security invariant is that no angle bracket survives the conversion,
    // so the output can never contain (or re-form) an HTML tag. The tag name may
    // remain as harmless plain text, which is fine for a React Native <Text>.
    const malicious: ReadonlyArray<string> = [
      "<script>alert(1)</script>",
      "<scr<script>ipt>alert(1)",
      "<<script>script>alert(1)",
      "<img src=x onerror=alert(1)>"
    ];

    test.each(malicious)("leaves no residual angle bracket for %j", input => {
      expect(markdownToPlainText(input)).not.toMatch(/[<>]/);
    });
  });
});
