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
const findEmptyEntries = (node: unknown, path = ""): ReadonlyArray<string> => {
  if (typeof node !== "object" || node === null) {
    return node === "" ? [path] : [];
  }
  const entries = Object.entries(node);
  return entries.length === 0
    ? [path]
    : entries.flatMap(([key, value]) =>
        findEmptyEntries(value, path === "" ? key : `${path}.${key}`)
      );
};

describe("locales", () => {
  /**
   * TypeScript checks that every `I18n.t` key exists (`TranslationKeys` is
   * derived from the `it` JSON), but it cannot check values: a key holding ""
   * type-checks fine. This test guards that blind spot by keeping empty values
   * out of the locale files, while `returnEmptyString: false` in the i18next
   * config covers the runtime side, treating "" as missing and falling back to
   * `it` instead of rendering blank text.
   *
   * Copy that is intentionally absent must therefore have no key at all, and
   * the consuming code must express its absence with `undefined` (skipping the
   * `I18n.t` call) rather than pointing at an empty value.
   */
  it.each(locales)(
    "$name should contain no empty values nor empty objects",
    ({ tree }) => {
      expect(findEmptyEntries(tree)).toEqual([]);
    }
  );
});
