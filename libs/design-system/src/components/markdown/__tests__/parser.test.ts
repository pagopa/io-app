import { parse, parseLite } from "../parser";
import { MarkdownNode, MarkdownNodeType } from "../types";

/** Recursively collect all node types in an AST */
const collectTypes = (nodes: ReadonlyArray<MarkdownNode>): Array<string> =>
  nodes.flatMap(n => [n.type, ...collectTypes(n.children)]);

/** Find first node matching a type (depth-first) */
const findNode = (
  nodes: ReadonlyArray<MarkdownNode>,
  type: MarkdownNodeType
): MarkdownNode | undefined => {
  for (const n of nodes) {
    if (n.type === type) {
      return n;
    }
    const found = findNode(n.children, type);
    if (found) {
      return found;
    }
  }
  return undefined;
};

describe("parseLite — supported content", () => {
  it("parses plain paragraph text", () => {
    const ast = parseLite("Hello world");
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe("paragraph");
    const textNode = findNode(ast, "text");
    expect(textNode).toBeDefined();
    expect(textNode!.content).toBe("Hello world");
  });

  it("parses **bold** text", () => {
    const ast = parseLite("**bold**");
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe("paragraph");
    const strong = findNode(ast, "strong");
    expect(strong).toBeDefined();
    const textNode = findNode(strong!.children, "text");
    expect(textNode).toBeDefined();
    expect(textNode!.content).toBe("bold");
  });

  it("parses *italic* text", () => {
    const ast = parseLite("*italic*");
    expect(ast).toHaveLength(1);
    const em = findNode(ast, "em");
    expect(em).toBeDefined();
    const textNode = findNode(em!.children, "text");
    expect(textNode).toBeDefined();
    expect(textNode!.content).toBe("italic");
  });

  it("parses ***bold+italic*** text with nested strong/em", () => {
    const ast = parseLite("***both***");
    const types = collectTypes(ast);
    expect(types).toContain("strong");
    expect(types).toContain("em");
    const textNode = findNode(ast, "text");
    expect(textNode).toBeDefined();
    expect(textNode!.content).toBe("both");
  });

  it("parses [link](url) with href attribute and text child", () => {
    const ast = parseLite("[click me](https://example.com)");
    const link = findNode(ast, "link");
    expect(link).toBeDefined();
    expect(link!.attributes?.href).toBe("https://example.com");
    const textNode = findNode(link!.children, "text");
    expect(textNode).toBeDefined();
    expect(textNode!.content).toBe("click me");
  });

  it("parses softbreak (single newline within paragraph)", () => {
    const ast = parseLite("line1\nline2");
    const sb = findNode(ast, "softbreak");
    expect(sb).toBeDefined();
  });

  it("parses hardbreak (two spaces + newline)", () => {
    const ast = parseLite("line1  \nline2");
    const hb = findNode(ast, "hardbreak");
    expect(hb).toBeDefined();
  });

  it("parses multiple paragraphs as separate paragraph nodes", () => {
    const ast = parseLite("First paragraph\n\nSecond paragraph");
    const paragraphs = ast.filter(n => n.type === "paragraph");
    expect(paragraphs.length).toBe(2);
  });
});

describe("parseLite — unsupported content is skipped", () => {
  const UNSUPPORTED_TYPES = [
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "heading5",
    "heading6",
    "image",
    "bullet_list",
    "list_item",
    "ordered_list",
    "fence",
    "code_block",
    "code_inline",
    "blockquote",
    "table",
    "hr",
    "html_block",
    "html_inline"
  ];

  const unsupportedTypesIn = (ast: ReadonlyArray<MarkdownNode>) =>
    collectTypes(ast).filter(type => UNSUPPORTED_TYPES.includes(type));

  it.each<string>([
    "# H1",
    "## H2",
    "### H3",
    "#### H4",
    "##### H5",
    "###### H6"
  ])("skips heading '%s'", input => {
    expect(unsupportedTypesIn(parseLite(input))).toEqual([]);
  });

  it("skips image ![alt](url)", () => {
    expect(
      unsupportedTypesIn(parseLite("![alt text](https://img.png)"))
    ).toEqual([]);
  });

  it("skips unordered list - item", () => {
    expect(unsupportedTypesIn(parseLite("- item one\n- item two"))).toEqual([]);
  });

  it("skips ordered list 1. item", () => {
    expect(unsupportedTypesIn(parseLite("1. first\n2. second"))).toEqual([]);
  });

  it("skips fenced code block", () => {
    expect(unsupportedTypesIn(parseLite("```\nconst x = 1;\n```"))).toEqual([]);
  });

  it("skips inline code `code`", () => {
    expect(unsupportedTypesIn(parseLite("some `inline code` here"))).toEqual(
      []
    );
  });

  it("skips blockquote > text", () => {
    expect(unsupportedTypesIn(parseLite("> quoted text"))).toEqual([]);
  });

  it("skips table", () => {
    expect(
      unsupportedTypesIn(
        parseLite("| Col1 | Col2 |\n|------|------|\n| A | B |")
      )
    ).toEqual([]);
  });

  it("skips horizontal rule ---", () => {
    expect(unsupportedTypesIn(parseLite("---"))).toEqual([]);
  });

  it("skips HTML <div>text</div>", () => {
    // html is disabled in md config, so this should not produce html nodes
    expect(unsupportedTypesIn(parseLite("<div>text</div>"))).toEqual([]);
  });
});

describe("parseLite — edge cases", () => {
  it("returns empty array for empty string", () => {
    const ast = parseLite("");
    expect(ast).toEqual([]);
  });

  it("returns no meaningful content for only unsupported markdown", () => {
    const ast = parseLite("- list\n\n> quote\n\n---\n\n```\ncode\n```");
    // Should either be empty or contain only empty paragraph wrappers
    const types = collectTypes(ast);
    for (const t of [
      "bullet_list",
      "list_item",
      "blockquote",
      "hr",
      "fence",
      "code_block"
    ]) {
      expect(types).not.toContain(t);
    }
  });

  it("keeps supported nodes when mixed with unsupported content", () => {
    const ast = parseLite(
      "Hello **world**\n\n- list item\n\nAnother paragraph"
    );
    const paragraphs = ast.filter(n => n.type === "paragraph");
    expect(paragraphs.length).toBe(2);
    const strong = findNode(ast, "strong");
    expect(strong).toBeDefined();
    // No list nodes
    const types = collectTypes(ast);
    expect(types).not.toContain("bullet_list");
    expect(types).not.toContain("list_item");
  });
});

/* ─── Full parse: image lifting ─── */

/** Recursively collect all node types in an AST (full parse version) */
const collectAllTypes = (nodes: ReadonlyArray<MarkdownNode>): Array<string> =>
  nodes.flatMap(n => [n.type, ...collectAllTypes(n.children)]);

/** Find first node matching a type (depth-first, full parse version) */
const findAnyNode = (
  nodes: ReadonlyArray<MarkdownNode>,
  type: string
): MarkdownNode | undefined => {
  for (const n of nodes) {
    if (n.type === type) {
      return n;
    }
    const found = findAnyNode(n.children, type);
    if (found) {
      return found;
    }
  }
  return undefined;
};

describe("parse — image lifting", () => {
  it("lifts a standalone image out of its paragraph wrapper", () => {
    const ast = parse("![alt text](https://example.com/img.png)");
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe("image");
    expect(ast[0].attributes?.src).toBe("https://example.com/img.png");
    expect(ast[0].attributes?.alt).toBe("alt text");
  });

  it("lifts image between text paragraphs to top-level", () => {
    const ast = parse("Before\n\n![alt](https://example.com/img.png)\n\nAfter");
    expect(ast).toHaveLength(3);
    expect(ast[0].type).toBe("paragraph");
    expect(ast[1].type).toBe("image");
    expect(ast[1].attributes?.src).toBe("https://example.com/img.png");
    expect(ast[2].type).toBe("paragraph");
  });

  it("splits a paragraph with mixed text and image into separate nodes", () => {
    const ast = parse(
      "Some text ![alt](https://example.com/img.png) more text"
    );
    expect(ast).toHaveLength(3);
    expect(ast[0].type).toBe("paragraph");
    expect(ast[1].type).toBe("image");
    expect(ast[2].type).toBe("paragraph");
  });

  it("lifts multiple images from separate paragraphs", () => {
    const ast = parse("![a](url1)\n\n![b](url2)");
    expect(ast).toHaveLength(2);
    expect(ast[0].type).toBe("image");
    expect(ast[1].type).toBe("image");
  });

  it("does not nest image inside a paragraph node", () => {
    const ast = parse("![alt](https://example.com/img.png)");
    const paragraphs = ast.filter(n => n.type === "paragraph");
    for (const p of paragraphs) {
      const nestedImage = findAnyNode(p.children, "image");
      expect(nestedImage).toBeUndefined();
    }
  });

  it("leaves paragraphs without images unchanged", () => {
    const ast = parse("Just **text** here");
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe("paragraph");
    expect(collectAllTypes(ast)).not.toContain("image");
  });
});
