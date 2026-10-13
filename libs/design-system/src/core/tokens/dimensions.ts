/*
DIMENSION TOKENS
Every value is a `dimension` token as defined by the W3C Design Tokens
Community Group format (Format Module 2025.10):
https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
Values are unitless dp, as React Native expects: the DTCG
`{ value, unit: "px" }` form maps to them 1:1.

Three tiers (Material 3 naming: reference → system → component), merged by
property as the Figma `Dimensions/*` variables:
- scales: `IODimensionScale`, every value a spacing, radius or stroke can
  take, and its per-property subsets (`gap.scale`, `padding.screen.scale`,
  `radius.scale`)
- `system`: values shared across components (`radius.default`)
- component values (`radius.tag`): a reference to `system` is an alias, as a
  Figma variable bound to another one; a literal is a detached value
Sizes (icons, pictograms, avatars…) are independent ramps, not bound to the scale.
`size` is square (width = height); single-axis values go in `height`.

Group shape: every group is an object. If the property has a ramp, the ramp is
its `scale` array; named entries bound to that ramp sit next to it
(`radius: { scale, default, tag, … }`). Groups with no ramp have no `scale`
(`stroke`, `size.avatar`).
*/

export const IODimensionScale = [
  0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96
] as const;
export type IODimensionScale = (typeof IODimensionScale)[number];

type IODimensionSubset = ReadonlyArray<IODimensionScale>;
type Named<T> = { [key: string]: Named<T> | T };

/* SCALES */

/* Values accepted by the `<Spacer>` and `<Stack>` components */
const gapScale = [
  0, 4, 6, 8, 12, 16, 24, 32, 40, 48
] as const satisfies IODimensionSubset;
export type IOSpace = (typeof gapScale)[number];

/* Horizontal screen paddings accepted by the `<ContentWrapper>` component */
const screenPadding = [8, 16, 24, 32, 48] as const satisfies IODimensionSubset;
export type IOScreenPadding = (typeof screenPadding)[number];

const radiusScale = [6, 8, 12, 16, 24] as const satisfies IODimensionSubset;
export type IORadius = (typeof radiusScale)[number];

const iconSize = [16, 20, 24, 32, 48] as const;
type IOIconSize = (typeof iconSize)[number];
const pictogramSize = [48, 64, 80, 120, 180] as const;
type IOPictogramSize = (typeof pictogramSize)[number];

/* SYSTEM */

const system = {
  gap: {
    /* Between the leading graphic (icon, logo, avatar) and the content */
    leading: 12,
    /* Between a label and its description */
    description: 4,
    /* Between a caption icon and its small text */
    caption: 4,
    /* Between a top element (e.g. badge) and the content below */
    topElement: 4
  },
  padding: {
    screen: {
      /* Standard horizontal margin of every screen */
      default: 24,
      /* Messages inbox, whose list items sit closer to the edges */
      messages: 16,
      /* Micro-margin of large cards leading a screen (e.g. bonus cards) */
      heroCard: 8,
      /* Centred content (e.g. pictogram-led screens), to keep centred lines short */
      centred: 32,
      /* Space left below the last element of a scrollable screen */
      end: 32
    }
  },
  radius: { default: 8 },
  size: {
    icon: {
      /* The same navigation chevron everywhere */
      chevron: 24,
      /* Leading graphic of a row, aligned across list items and modules */
      leading: 24,
      /* Small icon preceding a caption (e.g. date, suggestion) */
      caption: 16
    }
  },
  stroke: { default: 1, focused: 2 }
} as const satisfies {
  gap: Record<string, IOSpace>;
  padding: { screen: Record<string, IOScreenPadding> };
  radius: Record<string, IORadius>;
  size: { icon: Record<string, IOIconSize> };
  stroke: Record<string, IODimensionScale>;
};

/* COMPONENT */

/* Figma: `Dimensions/Gap/*` */
const componentGap = {
  alert: { leading: system.gap.leading, action: 8 },
  banner: { leading: 8, description: system.gap.description, action: 12 },
  featureInfo: { leading: 24, action: 4 },
  listItem: {
    leading: system.gap.leading,
    action: 16,
    description: system.gap.description,
    caption: system.gap.caption,
    topElement: system.gap.topElement
  },
  /* Leading graphic → content, content → trailing element (chevron, badge…) */
  module: {
    leading: system.gap.leading,
    trailing: 8,
    topElement: system.gap.topElement
  },
  /* `control`: between the label and the checkbox, radio or switch */
  selection: {
    leading: system.gap.leading,
    control: 8,
    action: 8,
    description: system.gap.description,
    caption: system.gap.caption
  },
  tag: { leading: 6 }
} as const satisfies Named<IOSpace>;

/* Figma: `Dimensions/Paddings/*` */
const componentPadding = {
  accordion: 16,
  alert: { default: 16, fullWidth: system.padding.screen.default },
  badge: { horizontal: 8, vertical: 4 },
  banner: 16,
  footer: { vertical: 16 },
  listItem: {
    default: { horizontal: system.padding.screen.default, vertical: 12 },
    messages: { horizontal: system.padding.screen.messages, vertical: 12 }
  },
  module: { horizontal: 16, vertical: 16 },
  tag: { horizontal: 8, vertical: 6 }
} as const satisfies Named<IODimensionScale>;

/* Figma: `Dimensions/Radius/*` */
const componentRadius = {
  accordion: system.radius.default,
  alert: system.radius.default,
  banner: system.radius.default,
  button: system.radius.default,
  module: system.radius.default,
  avatar: { small: system.radius.default, medium: 12 },
  bottomSheet: 24,
  badge: 24,
  selection: { control: 6 },
  tag: 6
} as const satisfies Named<IORadius>;

/* Figma: `Dimensions/Stroke/*` */
const componentStroke = {
  selection: { control: 2 }
} as const satisfies Named<IODimensionScale>;

const componentIconSize = {
  banner: system.size.icon.leading,
  featureInfo: system.size.icon.leading,
  listItem: system.size.icon.leading,
  module: { leading: system.size.icon.leading },
  selection: system.size.icon.leading,
  tag: 16
} as const satisfies Named<IOIconSize>;

const componentPictogramSize = {
  banner: 80,
  featureInfo: 48
} as const satisfies Named<IOPictogramSize>;

/* Component sizes, independent of every scale: values are not type-checked */
const componentSize = {
  avatar: { small: 44, medium: 66 },
  iconButton: { small: 24, default: 48, large: 56 },
  iconContained: 44,
  /* Checkbox and radio control */
  selection: { control: 24 }
} as const;

const componentHeight = {
  button: 48,
  header: 56
} as const;

const offset = {
  banner: { close: 8 },
  scrollDown: {
    right: system.padding.screen.default,
    bottom: system.padding.screen.default
  }
} as const satisfies Named<IODimensionScale>;

/**
 * Dimension values grouped by property. Ramps are arrays under `scale`, so
 * components keep accepting plain numbers (`<Stack space={16}>`); named entries
 * next to them carry the intent of a context or a component.
 */
export const IODimensions = {
  gap: { scale: gapScale, ...system.gap, ...componentGap },
  padding: {
    screen: { scale: screenPadding, ...system.padding.screen },
    ...componentPadding
  },
  radius: { scale: radiusScale, ...system.radius, ...componentRadius },
  stroke: { ...system.stroke, ...componentStroke },
  size: {
    icon: { scale: iconSize, ...system.size.icon, ...componentIconSize },
    pictogram: { scale: pictogramSize, ...componentPictogramSize },
    ...componentSize
  },
  height: componentHeight,
  offset
} as const;
