import { convertReferenceLinksToInline } from "../markdownRenderer";

describe("convertReferenceLinksToInline", () => {
  // Test 1: Basic functionality
  test("converts basic reference-style links to inline links", () => {
    const input = `
Check out [Google][1] and [GitHub][gh].

[1]: https://google.com "Search Engine"
[gh]: https://github.com
`;

    const expected = `
Check out [Google](https://google.com) and [GitHub](https://github.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 2: Shortcut reference links
  test("converts shortcut reference links where label matches text", () => {
    const input = `
Visit [Google][] and [Stack Overflow][].

[Google]: https://google.com
[Stack Overflow]: https://stackoverflow.com "Q&A for programmers"
`;

    const expected = `
Visit [Google](https://google.com) and [Stack Overflow](https://stackoverflow.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 3: Links in headers
  test("converts reference links inside markdown headers", () => {
    const input = `
# Welcome to [My Blog][blog]

## Check out [GitHub][gh] for code

### Resources: [Documentation][docs]

[blog]: https://myblog.com "My Personal Blog"
[gh]: https://github.com
[docs]: https://docs.example.com "Official Documentation"
`;

    const expected = `
# Welcome to [My Blog](https://myblog.com)

## Check out [GitHub](https://github.com) for code

### Resources: [Documentation](https://docs.example.com)



`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 4: Links in lists
  test("converts reference links inside markdown lists", () => {
    const input = `
## Useful Resources

- [Google][1] - Search engine
- [GitHub][2] - Code repository
- [Stack Overflow][3] - Q&A platform

1. First, visit [Google][1]
2. Then check [GitHub][2]
3. Finally, browse [Stack Overflow][3]

[1]: https://google.com
[2]: https://github.com "Code Repository"
[3]: https://stackoverflow.com "Q&A for developers"
`;

    const expected = `
## Useful Resources

- [Google](https://google.com) - Search engine
- [GitHub](https://github.com) - Code repository
- [Stack Overflow](https://stackoverflow.com) - Q&A platform

1. First, visit [Google](https://google.com)
2. Then check [GitHub](https://github.com)
3. Finally, browse [Stack Overflow](https://stackoverflow.com)



`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 5: Links in blockquotes
  test("converts reference links inside blockquotes", () => {
    const input = `
> As mentioned in [the documentation][docs], this feature is experimental.
> 
> For more information, see [GitHub Issues][issues].

[docs]: https://docs.example.com "Official Documentation"
[issues]: https://github.com/example/repo/issues
`;

    const expected = `
> As mentioned in [the documentation](https://docs.example.com), this feature is experimental.
> 
> For more information, see [GitHub Issues](https://github.com/example/repo/issues).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 6: Links in code blocks and inline code (should not be converted)
  test("does convert reference links inside code blocks or inline code", () => {
    const input = `
Here's an example: \`[Google][1]\` should be converted.

\`\`\`markdown
[Google][1] should also be converted
[1]: https://google.com
\`\`\`

And this [Google][1] should be converted.

[1]: https://google.com
`;

    const expected = `
Here's an example: \`[Google](https://google.com)\` should be converted.

\`\`\`markdown
[Google](https://google.com) should also be converted

\`\`\`

And this [Google](https://google.com) should be converted.

`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 7: Mixed with other markdown elements
  test("converts reference links mixed with other markdown formatting", () => {
    const input = `
**Bold text** with [link][1] and *italic* text.

~~Strikethrough~~ and [another link][2].

[1]: https://example.com "Example Site"
[2]: https://test.com
`;

    const expected = `
**Bold text** with [link](https://example.com) and *italic* text.

~~Strikethrough~~ and [another link](https://test.com).

`;

    expect(convertReferenceLinksToInline(input).trim()).toBe(expected.trim());
  });

  // Test 8: Case insensitive labels
  test("handles case insensitive labels correctly", () => {
    const input = `
Visit [Google][GOOGLE] and [GitHub][github].

[google]: https://google.com
[GitHub]: https://github.com "Code Repository"
`;

    const expected = `
Visit [Google](https://google.com) and [GitHub](https://github.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 9: URLs with angle brackets
  test("handles URLs with angle brackets", () => {
    const input = `
Check out [Google][1] and [Example][2].

[1]: <https://google.com>
[2]: <https://example.com> "Example Site"
`;

    const expected = `
Check out [Google](https://google.com) and [Example](https://example.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 10: Different title quote styles
  test("handles different title quote styles", () => {
    const input = `
Links: [A][1], [B][2], [C][3], [D][4].

[1]: https://a.com "Double quotes"
[2]: https://b.com 'Single quotes'
[3]: https://c.com (Parentheses)
[4]: https://d.com
`;

    const expected = `
Links: [A](https://a.com), [B](https://b.com), [C](https://c.com), [D](https://d.com).




`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 11: Links with spaces in labels
  test("handles labels with spaces", () => {
    const input = `
Check [my site][my favorite site] and [the docs][api docs].

[my favorite site]: https://example.com
[api docs]: https://docs.example.com "API Documentation"
`;

    const expected = `
Check [my site](https://example.com) and [the docs](https://docs.example.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 12: No reference links
  test("leaves text unchanged when no reference links exist", () => {
    const input = `
# Regular Markdown

This is regular text with [inline links](https://example.com).

- List item 1
- List item 2

> A blockquote
`;

    expect(convertReferenceLinksToInline(input)).toBe(input);
  });

  // Test 13: Orphaned reference links (no matching definition)
  test("leaves orphaned reference links unchanged", () => {
    const input = `
Check out [Google][1] and [GitHub][missing].

[1]: https://google.com
`;

    const expected = `
Check out [Google](https://google.com) and [GitHub][missing].

`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 14: Multiple definitions for same label (should use first one)
  test("uses last definition when multiple definitions exist for same label", () => {
    const input = `
Visit [Google][1].

[1]: https://google.com "First Definition"
[1]: https://example.com "Second Definition"
`;

    const expected = `
Visit [Google](https://example.com).


`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 15: Complex real-world example
  test("handles complex real-world markdown document", () => {
    const input = `
# My Project Documentation

## Overview

This project uses [React][react] and [TypeScript][ts] for the frontend.

### Getting Started

1. Clone the repository from [GitHub][repo]
2. Install dependencies: \`npm install\`
3. Read the [documentation][docs]

### Resources

- [React Documentation][react] - Official React docs
- [TypeScript Handbook][ts] - Learn TypeScript
- **Important**: Check [GitHub Issues][issues] for known problems

> **Note**: For questions, visit [Stack Overflow][so] or [Discord][discord].

[react]: https://reactjs.org "React Library"
[ts]: https://www.typescriptlang.org
[repo]: https://github.com/user/project "Project Repository"
[docs]: https://docs.project.com "Project Documentation"
[issues]: https://github.com/user/project/issues
[so]: https://stackoverflow.com "Q&A Platform"
[discord]: https://discord.gg/project "Community Chat"
`;

    const expected = `
# My Project Documentation

## Overview

This project uses [React](https://reactjs.org) and [TypeScript](https://www.typescriptlang.org) for the frontend.

### Getting Started

1. Clone the repository from [GitHub](https://github.com/user/project)
2. Install dependencies: \`npm install\`
3. Read the [documentation](https://docs.project.com)

### Resources

- [React Documentation](https://reactjs.org) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org) - Learn TypeScript
- **Important**: Check [GitHub Issues](https://github.com/user/project/issues) for known problems

> **Note**: For questions, visit [Stack Overflow](https://stackoverflow.com) or [Discord](https://discord.gg/project).







`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });

  // Test 16: Empty input
  test("handles empty input", () => {
    expect(convertReferenceLinksToInline("")).toBe("");
  });

  // Test 17: Only link definitions (no references)
  test("removes link definitions when no references exist", () => {
    const input = `
Some text here.

[1]: https://example.com
[2]: https://test.com "Test Site"

More text here.
`;

    const expected = `
Some text here.



More text here.
`;

    expect(convertReferenceLinksToInline(input)).toBe(expected);
  });
});
