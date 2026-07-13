import { resources as supportedLangs } from "../i18n";

/* Derived from the i18n resources so that a newly supported locale is
   automatically covered by this test */
const locales = Object.entries(supportedLangs).map(([name, { index }]) => ({
  name,
  tree: index
}));

/**
 * Collects the dotted path of every empty string value and of every object with
 * no children.
 */
const findEmptyEntries = (node: unknown): ReadonlyArray<string> => {
  if (typeof node === "string") {
    return [];
  }
  if (typeof node !== "object" || node === null) {
    return [];
  }
  return Object.entries(node).flatMap(([key, value]) => {
    if (typeof value === "string") {
      return value === "" ? [key] : [];
    }
    if (typeof value === "object" && value !== null) {
      return Object.keys(value).length === 0
        ? [key]
        : findEmptyEntries(value).map(path => `${key}.${path}`);
    }
    return [];
  });
};

describe("locales", () => {
  /**
   * i18next renders an empty value as blank text, hiding a missing translation
   * instead of surfacing it. Copy that is intentionally absent must have no key
   * at all, and the consuming code must treat it as optional.
   */
  it.each(locales)(
    "$name should contain no empty values nor empty objects",
    ({ tree }) => {
      expect(findEmptyEntries(tree)).toEqual([]);
    }
  );
});
