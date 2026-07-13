import { fireEvent, render } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { Linking } from "react-native";
import { IOThemeContextProvider } from "../../../context";
import { IOColors, IOThemeLight } from "../../../core";
import { IOMarkdown } from "../IOMarkdown";

const defaultParagraphColor = IOColors[IOThemeLight["textBody-tertiary"]];

const renderComponent = (props: ComponentProps<typeof IOMarkdown>) =>
  render(
    <IOThemeContextProvider theme="light">
      <IOMarkdown {...props} />
    </IOThemeContextProvider>
  );

const getFirstParagraphStyles = (
  toJSON: ReturnType<typeof render>["toJSON"]
) => {
  const tree = toJSON();
  const root = Array.isArray(tree) ? tree[0] : tree;
  const paragraph = root?.children?.[0];
  if (!paragraph || typeof paragraph === "string") {
    return [];
  }
  return [paragraph?.props?.style].flat();
};

describe("IOMarkdown", () => {
  /* ─── Headings ─── */

  describe("Headings", () => {
    it("renders all heading levels", () => {
      const content = `# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6`;
      const { getByText } = renderComponent({ content });
      expect(getByText("H1")).toBeTruthy();
      expect(getByText("H2")).toBeTruthy();
      expect(getByText("H3")).toBeTruthy();
      expect(getByText("H4")).toBeTruthy();
      expect(getByText("H5")).toBeTruthy();
      expect(getByText("H6")).toBeTruthy();
    });

    it("wraps headings with accessibilityRole 'header'", () => {
      const content = `# Accessible Heading`;
      const { UNSAFE_getAllByProps } = renderComponent({ content });
      const headers = UNSAFE_getAllByProps({ accessibilityRole: "header" });
      expect(headers.length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ─── Paragraphs & inline styles ─── */

  describe("Paragraphs & inline styles", () => {
    it("renders paragraph text", () => {
      const { getByText } = renderComponent({ content: "Hello world" });
      expect(getByText("Hello world")).toBeTruthy();
    });

    it("renders plain paragraphs with the default Body tertiary color", () => {
      const { toJSON } = renderComponent({ content: "Hello world" });
      const styles = getFirstParagraphStyles(toJSON);

      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: defaultParagraphColor })
        ])
      );
    });

    it("applies the provided textAlign to paragraph text", () => {
      const { toJSON } = renderComponent({
        content: "Centered paragraph",
        textAlign: "center"
      });
      const styles = getFirstParagraphStyles(toJSON);

      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: defaultParagraphColor }),
          expect.objectContaining({ textAlign: "center" })
        ])
      );
    });

    it("renders bold text with fontWeight 600", () => {
      const { getByText } = renderComponent({ content: "**bold**" });
      const el = getByText("bold");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
    });

    it("renders italic text with fontStyle italic", () => {
      const { getByText } = renderComponent({ content: "*italic*" });
      const el = getByText("italic");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });

    it("renders bold+italic text with both fontWeight 600 and fontStyle italic", () => {
      const { getByText } = renderComponent({ content: "***bold italic***" });
      const el = getByText("bold italic");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });

    it("renders multiple styled segments in one paragraph", () => {
      const content = "plain **bold** plain *italic*";
      const { getByText } = renderComponent({ content });
      const boldEl = getByText("bold");
      const italicEl = getByText("italic");
      const boldStyles = [boldEl.props.style].flat();
      const italicStyles = [italicEl.props.style].flat();
      expect(boldStyles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
      expect(italicStyles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });
  });

  /* ─── Links ─── */

  describe("Links", () => {
    it("renders link with accessibilityRole 'link'", () => {
      const { getByRole } = renderComponent({
        content: "[click](https://example.com)"
      });
      expect(getByRole("link")).toBeTruthy();
    });

    it("calls onLinkPress with URL on press", () => {
      const onLinkPress = jest.fn();
      const { getByRole } = renderComponent({
        content: "[click](https://example.com)",
        onLinkPress
      });
      fireEvent.press(getByRole("link"));
      expect(onLinkPress).toHaveBeenCalledWith("https://example.com");
    });

    it("falls back to Linking.openURL when no onLinkPress", () => {
      const spy = jest
        .spyOn(Linking, "openURL")
        .mockImplementation(() => Promise.resolve());
      const { getByRole } = renderComponent({
        content: "[click](https://example.com)"
      });
      fireEvent.press(getByRole("link"));
      expect(spy).toHaveBeenCalledWith("https://example.com");
      spy.mockRestore();
    });

    it("renders bold link with fontWeight 600 and link role", () => {
      const { getByRole } = renderComponent({
        content: "**[bold link](https://example.com)**"
      });
      const link = getByRole("link");
      const styles = [link.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
    });

    it("renders italic link with fontStyle italic and link role", () => {
      const { getByRole } = renderComponent({
        content: "*[italic link](https://example.com)*"
      });
      const link = getByRole("link");
      const styles = [link.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });

    it("renders bold+italic link with all three styles", () => {
      const { getByRole } = renderComponent({
        content: "***[styled link](https://example.com)***"
      });
      const link = getByRole("link");
      const styles = [link.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });

    it("renders link with bold inside", () => {
      const { getByRole } = renderComponent({
        content: "[**bold inside**](https://example.com)"
      });
      const link = getByRole("link");
      const styles = [link.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
    });

    it("renders multiple links in one paragraph", () => {
      const content = "[first](https://a.com) and [second](https://b.com)";
      const onLinkPress = jest.fn();
      const { getAllByRole } = renderComponent({ content, onLinkPress });
      const links = getAllByRole("link");
      expect(links.length).toBe(2);
      fireEvent.press(links[0]);
      expect(onLinkPress).toHaveBeenCalledWith("https://a.com");
      fireEvent.press(links[1]);
      expect(onLinkPress).toHaveBeenCalledWith("https://b.com");
    });
  });

  /* ─── Lists ─── */

  describe("Lists", () => {
    it("renders unordered list items with bullets", () => {
      const content = `- Item one\n- Item two\n- Item three`;
      const { getByText, getAllByText } = renderComponent({ content });
      expect(getByText("Item one")).toBeTruthy();
      expect(getByText("Item two")).toBeTruthy();
      expect(getByText("Item three")).toBeTruthy();
      expect(getAllByText("\u2022").length).toBe(3);
    });

    it("renders ordered list items with numbers", () => {
      const content = `1. First\n2. Second\n3. Third`;
      const { getByText } = renderComponent({ content });
      expect(getByText("First")).toBeTruthy();
      expect(getByText("Second")).toBeTruthy();
      expect(getByText("Third")).toBeTruthy();
      expect(getByText("1.")).toBeTruthy();
      expect(getByText("2.")).toBeTruthy();
      expect(getByText("3.")).toBeTruthy();
    });

    it("renders nested ordered lists with level-specific markers", () => {
      const content = `1. First\n    1. Nested first\n    2. Nested second\n        1. Third level first\n        2. Third level second\n2. Second`;
      const { getByText } = renderComponent({ content });
      expect(getByText("1.")).toBeTruthy();
      expect(getByText("2.")).toBeTruthy();
      expect(getByText("i.")).toBeTruthy();
      expect(getByText("ii.")).toBeTruthy();
      expect(getByText("a.")).toBeTruthy();
      expect(getByText("b.")).toBeTruthy();
    });

    it("renders nested unordered lists with level-specific bullets", () => {
      const content = `- Parent item\n    - Nested item\n        - Third level item\n- Second parent item`;
      const { getAllByText } = renderComponent({ content });
      expect(getAllByText("\u2022").length).toBeGreaterThanOrEqual(1);
      expect(getAllByText("\u25E6").length).toBe(1);
    });

    it("renders list with accessibilityRole 'list'", () => {
      const content = `- Item one\n- Item two`;
      const { getAllByRole } = renderComponent({ content });
      expect(getAllByRole("list").length).toBeGreaterThanOrEqual(1);
    });

    it("renders bold text inside list items", () => {
      const content = `- **bold item**`;
      const { getByText } = renderComponent({ content });
      const el = getByText("bold item");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
    });

    it("renders italic text inside list items", () => {
      const content = `- *italic item*`;
      const { getByText } = renderComponent({ content });
      const el = getByText("italic item");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });
  });

  /* ─── Code ─── */

  describe("Code", () => {
    it("renders inline code", () => {
      const content = "Use `console.log()` for debugging";
      const { getByText } = renderComponent({ content });
      expect(getByText("console.log()")).toBeTruthy();
    });

    it("renders code block (fence)", () => {
      const content = "```\nconst x = 1;\n```";
      const { getByText } = renderComponent({ content });
      expect(getByText(/const x = 1/)).toBeTruthy();
    });

    it("renders inline code mixed with text in paragraph", () => {
      const content = "Run `npm install` then `npm start`";
      const { getByText } = renderComponent({ content });
      expect(getByText("npm install")).toBeTruthy();
      expect(getByText("npm start")).toBeTruthy();
    });
  });

  /* ─── Horizontal rule ─── */

  describe("Horizontal rule", () => {
    it("renders horizontal rule as Divider", () => {
      const content = "Above\n\n---\n\nBelow";
      const { getByText } = renderComponent({ content });
      expect(getByText("Above")).toBeTruthy();
      expect(getByText("Below")).toBeTruthy();
    });
  });

  /* ─── Blockquote / Banner ─── */

  describe("Blockquote / Banner", () => {
    it("renders plain blockquote text", () => {
      const content = `> Some quote content`;
      const { getByText } = renderComponent({ content });
      expect(getByText("Some quote content")).toBeTruthy();
    });

    it("renders blockquote with heading as Banner title", () => {
      const content = `> ## Banner Title\n> Body text here`;
      const { getByText } = renderComponent({ content });
      expect(getByText("Banner Title")).toBeTruthy();
      expect(getByText("Body text here")).toBeTruthy();
    });

    it("renders blockquote with [!notification] pictogram", () => {
      const content = `> [!notification]\n> Some notification content`;
      const { getByText } = renderComponent({ content });
      expect(getByText("Some notification content")).toBeTruthy();
    });

    it("renders blockquote with heading and body content", () => {
      const content = `> ## Title\n> [!notification]\n> Content`;
      const { getByText } = renderComponent({ content });
      expect(getByText("Title")).toBeTruthy();
    });
  });

  /* ─── Line breaks ─── */

  describe("Line breaks", () => {
    it("renders softbreak as newline", () => {
      const content = "Line one\nLine two";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Line one/)).toBeTruthy();
      expect(getByText(/Line two/)).toBeTruthy();
    });

    it("renders hardbreak as newline", () => {
      // Two trailing spaces + newline = hardbreak in markdown
      const content = "Line one  \nLine two";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Line one/)).toBeTruthy();
      expect(getByText(/Line two/)).toBeTruthy();
    });
  });

  /* ─── HTML breaks ─── */

  describe("HTML breaks", () => {
    it("renders <br> as newline", () => {
      const content = "Before<br>After";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Before/)).toBeTruthy();
      expect(getByText(/After/)).toBeTruthy();
    });

    it("renders <br/> as newline", () => {
      const content = "Before<br/>After";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Before/)).toBeTruthy();
      expect(getByText(/After/)).toBeTruthy();
    });
  });

  /* ─── disabledRules ─── */

  describe("disabledRules", () => {
    it("does not render lists when bullet_list and ordered_list are disabled", () => {
      const content = `- Item one\n\n1. First`;
      const { queryByText } = renderComponent({
        content,
        disabledRules: ["bullet_list", "ordered_list", "list_item"]
      });
      expect(queryByText("Item one")).toBeNull();
      expect(queryByText("First")).toBeNull();
    });

    it("does not render code when code_inline and fence are disabled", () => {
      const content = "Use `code` here\n\n```\nblock\n```";
      const { queryByText } = renderComponent({
        content,
        disabledRules: ["code_inline", "fence"]
      });
      expect(queryByText("code")).toBeNull();
      expect(queryByText("block")).toBeNull();
    });

    it("does not render images when image is in disabledRules", () => {
      const content = "![Placeholder](https://picsum.photos/200/200)";
      const { queryByLabelText } = renderComponent({
        content,
        disabledRules: ["image"]
      });
      expect(queryByLabelText("Placeholder")).toBeNull();
    });
  });

  /* ─── Images ─── */

  describe("Images", () => {
    it("renders an image with source and alt label", () => {
      const content = "![Placeholder](https://picsum.photos/200/200)";
      const { getByLabelText } = renderComponent({ content });
      const image = getByLabelText("Placeholder");
      expect(image).toBeTruthy();
      expect(image.props.source).toEqual({
        uri: "https://picsum.photos/200/200"
      });
    });
  });

  /* ─── testID & empty ─── */

  describe("testID & empty content", () => {
    it("applies testID to the container view", () => {
      const { getByTestId } = renderComponent({
        content: "Hello",
        testID: "md-full"
      });
      expect(getByTestId("md-full")).toBeTruthy();
    });

    it("handles empty content string", () => {
      const { toJSON } = renderComponent({ content: "" });
      expect(toJSON()).toBeTruthy();
    });
  });
});
