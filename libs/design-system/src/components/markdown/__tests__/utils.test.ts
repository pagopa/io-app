import {
  collectRawText,
  extractPictogramName,
  getOrderedListMarker,
  getUnorderedListBullet,
  isBrTag,
  stripPictogramPrefix
} from "../utils";
import type { MarkdownNode } from "../types";

describe("markdown utils", () => {
  describe("getUnorderedListBullet", () => {
    it("returns a filled bullet for first-level unordered lists", () => {
      expect(getUnorderedListBullet(0)).toBe("\u2022");
    });

    it("returns a hollow bullet for second-level unordered lists", () => {
      expect(getUnorderedListBullet(1)).toBe("\u25E6");
    });

    it("returns a right pointing small triangle for third-level unordered lists", () => {
      expect(getUnorderedListBullet(2)).toBe("\u25B8");
    });

    it("restarts the bullet styles after the third level", () => {
      expect(getUnorderedListBullet(3)).toBe("\u2022");
      expect(getUnorderedListBullet(4)).toBe("\u25E6");
      expect(getUnorderedListBullet(5)).toBe("\u25B8");
    });
  });

  describe("getOrderedListMarker", () => {
    it("returns decimal markers for first-level ordered lists", () => {
      expect(getOrderedListMarker(1, 0)).toBe("1.");
      expect(getOrderedListMarker(12, 0)).toBe("12.");
    });

    it("returns lowercase roman markers for second-level ordered lists", () => {
      expect(getOrderedListMarker(1, 1)).toBe("i.");
      expect(getOrderedListMarker(4, 1)).toBe("iv.");
      expect(getOrderedListMarker(9, 1)).toBe("ix.");
    });

    it("returns lowercase alphabetic markers for third-level ordered lists", () => {
      expect(getOrderedListMarker(1, 2)).toBe("a.");
      expect(getOrderedListMarker(2, 2)).toBe("b.");
      expect(getOrderedListMarker(26, 2)).toBe("z.");
      expect(getOrderedListMarker(27, 2)).toBe("aa.");
    });

    it("restarts the marker styles after the third level", () => {
      expect(getOrderedListMarker(3, 3)).toBe("3.");
      expect(getOrderedListMarker(4, 4)).toBe("iv.");
      expect(getOrderedListMarker(2, 5)).toBe("b.");
    });
  });

  describe("extractPictogramName", () => {
    it("returns the pictogram name when the directive is valid", () => {
      expect(extractPictogramName("[!attention] Message")).toBe("attention");
    });

    it("falls back to notification for invalid pictogram names", () => {
      expect(extractPictogramName("[!nope] Message")).toBe("notification");
    });
  });

  describe("stripPictogramPrefix", () => {
    it("removes the pictogram directive from text", () => {
      expect(stripPictogramPrefix("[!attention] Message")).toBe(" Message");
    });
  });

  describe("collectRawText", () => {
    it("collects content recursively from a markdown node", () => {
      const node: MarkdownNode = {
        type: "paragraph",
        key: "paragraph-1",
        children: [
          {
            type: "text",
            key: "text-1",
            content: "Hello ",
            children: [],
            listDepth: 0
          },
          {
            type: "strong",
            key: "strong-1",
            children: [
              {
                type: "text",
                key: "text-2",
                content: "world",
                children: [],
                listDepth: 0
              }
            ],
            listDepth: 0
          }
        ],
        listDepth: 0
      };

      expect(collectRawText(node)).toBe("Hello world");
    });
  });

  describe("isBrTag", () => {
    it("returns true for br tags", () => {
      expect(isBrTag("<br>")).toBe(true);
      expect(isBrTag("<br/>")).toBe(true);
    });

    it("returns false for other html tags", () => {
      expect(isBrTag("<div>")).toBe(false);
    });
  });
});
