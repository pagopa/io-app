/*
COLOR TOKENS
Three tiers, as in `IODimensions`:
- Palette: `IOColorPalette`, the hue ramps (see `palette.ts`)
- Semantic: one object per mode, from the Figma `Semantics` collection
  (see `semantic.ts`)
- Component: each component declares its colors in its own `colors.ts`, by
  variant, role (`background`, `foreground`, `border`) and state. A reference
  to a semantic token follows a design choice shared with other components; a
  palette value is a deliberate exception

Component configs import only `palette.ts`, `semantic.ts` and `utils.ts`:
importing this file or the theme context would create a cycle.
*/

import { accordionColors } from "../../../components/accordion/colors";
import { alertColors } from "../../../components/alert/colors";
import { avatarColors } from "../../../components/avatar/colors";
import { badgeColors } from "../../../components/badge/colors";
import { bannerColors } from "../../../components/banner/colors";
import {
  iconButtonColors,
  iconButtonSolidColors
} from "../../../components/buttons/colors";
import { buttonColors } from "../../../components/buttons/IOButton/colors";
import { checkboxColors } from "../../../components/checkbox/colors";
import { codeInputColors } from "../../../components/codeInput/colors";
import { featureInfoColors } from "../../../components/featureInfo/colors";
import { headerColors } from "../../../components/headers/colors";
import { dividerColors, footerColors } from "../../../components/layout/colors";
import { listItemColors } from "../../../components/listitems/colors";
import { loadingSpinnerColors } from "../../../components/loadingSpinner/colors";
import { codeBlockColors } from "../../../components/markdown/colors";
import { moduleColors } from "../../../components/modules/colors";
import { numberButtonColors } from "../../../components/numberpad/colors";
import { otpInputColors } from "../../../components/otpInput/colors";
import { pictogramColors } from "../../../components/pictograms/colors";
import { progressLoaderColors } from "../../../components/progressLoader/colors";
import { searchInputColors } from "../../../components/searchInput/colors";
import { skeletonColors } from "../../../components/skeleton/colors";
import { stepperColors } from "../../../components/stepper/colors";
import { switchColors } from "../../../components/switch/colors";
import { tabItemColors } from "../../../components/tabs/colors";
import { tagColors } from "../../../components/tag/colors";
import { textInputColors } from "../../../components/textInput/colors";
import { toastColors } from "../../../components/toast/colors";
import { tooltipColors } from "../../../components/tooltip/colors";
import { typographyColors } from "../../../components/typography/colors";
import { dark, IOColorMode, IOColorSemantics, light } from "./semantic";

export * from "./palette";
export type {
  IOColorMode,
  IOColorSemantics,
  IOColorStates,
  IOComponentColor,
  IOComponentColors
} from "./semantic";
export { withAlpha } from "./utils";

/* Tags each token with its group's role: types only, values unchanged */
const withRoles = (s: typeof dark | typeof light) =>
  s as unknown as IOColorSemantics;

const theme = (s: IOColorSemantics, mode: IOColorMode) => ({
  ...s,
  component: {
    accordion: accordionColors(s),
    alert: alertColors(s),
    alertEdgeToEdge: alertColors(withRoles(light)),
    avatar: avatarColors(s),
    badge: badgeColors(s),
    banner: bannerColors(s, mode),
    button: buttonColors(s),
    checkbox: checkboxColors(s),
    codeBlock: codeBlockColors(s),
    codeInput: codeInputColors(s),
    divider: dividerColors(s),
    featureInfo: featureInfoColors(s),
    footer: footerColors(s),
    header: headerColors(s),
    iconButton: iconButtonColors(s),
    iconButtonSolid: iconButtonSolidColors(s),
    listItem: listItemColors(s),
    loadingSpinner: loadingSpinnerColors(s),
    module: moduleColors(s),
    numberButton: numberButtonColors(s),
    otpInput: otpInputColors(s),
    pictogram: pictogramColors(s),
    progressLoader: progressLoaderColors(s),
    /* Same look as the checkbox */
    radio: checkboxColors(s),
    searchInput: searchInputColors(s),
    skeleton: skeletonColors(s),
    stepper: stepperColors(s, mode),
    switch: switchColors(s),
    tabItem: tabItemColors(s, mode),
    tag: tagColors(s),
    textInput: textInputColors(s),
    toast: toastColors(withRoles(light), mode),
    tooltip: tooltipColors(s),
    typography: typographyColors(s)
  }
});

export type IOColorTheme = ReturnType<typeof theme>;

/**
 * Color tokens of each mode: the design tool's semantic tokens, plus the
 * component colors under `component`.
 */
export const IOColors: Record<IOColorMode, IOColorTheme> = {
  light: theme(withRoles(light), "light"),
  dark: theme(withRoles(dark), "dark")
};
