import { fireEvent, render } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { Linking } from "react-native";
import { IOThemeContextProvider } from "../../../context";
import { IOColors, IOThemeLight } from "../../../core";
import { IOMarkdownLite } from "../IOMarkdownLite";

const defaultParagraphColor = IOColors[IOThemeLight["textBody-tertiary"]];

const renderComponent = (props: ComponentProps<typeof IOMarkdownLite>) =>
  render(
    <IOThemeContextProvider theme="light">
      <IOMarkdownLite {...props} />
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

describe("IOMarkdownLite", () => {
  /* ─── Supported content ─── */

  describe("Supported content", () => {
    it("renders basic paragraph text", () => {
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
        content: "Right aligned paragraph",
        textAlign: "right"
      });
      const styles = getFirstParagraphStyles(toJSON);

      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: defaultParagraphColor }),
          expect.objectContaining({ textAlign: "right" })
        ])
      );
    });

    it("renders bold text with fontWeight 600", () => {
      const { getByText } = renderComponent({ content: "**bold text**" });
      const el = getByText("bold text");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: "600" })])
      );
    });

    it("renders italic text with fontStyle italic", () => {
      const { getByText } = renderComponent({ content: "*italic text*" });
      const el = getByText("italic text");
      const styles = [el.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontStyle: "italic" })
        ])
      );
    });

    it("renders bold+italic text with both styles", () => {
      const { getByText } = renderComponent({
        content: "***bold italic***"
      });
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

    it("renders link with accessibilityRole 'link'", () => {
      const { getByRole } = renderComponent({
        content: "[click](https://example.com)"
      });
      expect(getByRole("link")).toBeTruthy();
    });

    it("calls onLinkPress callback when link is pressed", () => {
      const onLinkPress = jest.fn();
      const { getByRole } = renderComponent({
        content: "[click](https://example.com)",
        onLinkPress
      });
      fireEvent.press(getByRole("link"));
      expect(onLinkPress).toHaveBeenCalledWith("https://example.com");
    });

    it("falls back to Linking.openURL when no onLinkPress provided", () => {
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

    it("renders softbreak as newline", () => {
      const content = "Line one\nLine two";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Line one/)).toBeTruthy();
      expect(getByText(/Line two/)).toBeTruthy();
    });

    it("renders hardbreak as newline", () => {
      const content = "Line one  \nLine two";
      const { getByText } = renderComponent({ content });
      expect(getByText(/Line one/)).toBeTruthy();
      expect(getByText(/Line two/)).toBeTruthy();
    });
  });

  /* ─── Unsupported content ─── */

  describe("Unsupported content", () => {
    it("does not render headings, lists, blockquotes, code, or images", () => {
      const { queryByText } = renderComponent({
        content:
          "#Title\n- list item\n\n> blockquote\n\n```\ncode block\n```\n\n![alt](img.png)"
      });
      expect(queryByText("title")).toBeNull();
      expect(queryByText("list item")).toBeNull();
      expect(queryByText("blockquote")).toBeNull();
      expect(queryByText("code block")).toBeNull();
    });
  });

  /* ─── Props ─── */

  describe("Props", () => {
    it("applies testID to the container view", () => {
      const { getByTestId } = renderComponent({
        content: "Hello",
        testID: "md-lite"
      });
      expect(getByTestId("md-lite")).toBeTruthy();
    });

    it("handles empty content string", () => {
      const { toJSON } = renderComponent({ content: "" });
      expect(toJSON()).toBeTruthy();
    });
  });
});
