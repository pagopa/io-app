import { IOColorTheme } from "@io-app/design-system";

/** Colors of the main navigation. */
export const navigationColors = (s: IOColorTheme) => ({
  /** Icon and label of the main tab bar items */
  tabBar: {
    foreground: {
      active: s.foreground.action.primary.default,
      inactive: s.text.content.tertiary
    }
  }
});
