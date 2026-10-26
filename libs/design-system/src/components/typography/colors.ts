import type { IOTypography } from "../../core/IOTypography";
import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* Keyed by style, not grouped: a consumer reads `typography.h1`, and one style can change color alone */
export const typographyColors = (s: IOColorSemantics) =>
  ({
    hero: s.text.heading.default,
    h1: s.text.heading.default,
    h2: s.text.heading.default,
    h3: s.text.heading.default,
    h4: s.text.heading.default,
    h5: s.text.heading.default,
    h6: s.text.heading.default,
    body: s.text.content.tertiary,
    bodySmall: s.text.content.tertiary,
    bodyMonospace: s.text.content.tertiary,
    labelMini: s.text.content.tertiary,
    caption: s.text.content.default,
    mdH1: s.text.heading.default,
    mdH2: s.text.heading.default,
    mdH3: s.text.heading.default,
    /* The label of an action */
    buttonText: s.foreground.action.primary.default,
    /* Any style rendered `asLink` */
    link: s.text.content.action
  }) satisfies Record<"link" | IOTypography, IOComponentColor<"foreground">>;
