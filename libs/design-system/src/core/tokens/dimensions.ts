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
  Figma variable bound to another one; a literal is a detached value. Keyed by
  component name: removing a component removes its keys too, since nothing
  flags unused tokens
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
    /* Between the content and a trailing element on the same row (chevron, badge, control) */
    trailing: 8,
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
    },
    /* Inner space of a card surface (payment, CGN, featured service…) */
    card: 16
  },
  radius: {
    default: 8,
    /* Card surfaces */
    card: 8
  },
  size: {
    icon: {
      /* The same navigation chevron everywhere */
      chevron: 24,
      /* Leading graphic of a row, aligned across list items and modules */
      leading: 24,
      /* Small icon preceding a caption (e.g. date, suggestion) */
      caption: 16
    },
    pictogram: {
      /* Pictogram leading a result or empty-state screen */
      screen: 120,
      /* Pictogram leading an empty or error state inside a section or bottom sheet */
      inline: 80
    },
    /* Minimum touch area of an interactive element (Material 48dp, above Apple's 44pt) */
    touchTarget: 48
  },
  stroke: { default: 1, focused: 2 }
} as const satisfies {
  gap: Record<string, IOSpace>;
  padding: { card: IODimensionScale; screen: Record<string, IOScreenPadding> };
  radius: Record<string, IORadius>;
  size: {
    icon: Record<string, IOIconSize>;
    pictogram: Record<string, IOPictogramSize>;
    touchTarget: number;
  };
  stroke: Record<string, IODimensionScale>;
};

/* COMPONENT */

/* Figma: `Dimensions/Gap/*` */
const componentGap = {
  accordion: { leading: system.gap.leading, trailing: system.gap.trailing },
  alert: { leading: system.gap.leading, action: 8 },
  banner: { leading: 8, description: system.gap.description, action: 12 },
  /* `icon`: between the icon and the label, on either side */
  button: { icon: 8 },
  /* `items`: between the dots */
  codeInput: { items: 16 },
  featureInfo: { leading: 24, action: 4 },
  /* `actions`: between block buttons, stacked or inline; `link`: before the link button */
  footer: { actions: 16, link: 16 },
  /* `title`: between the side actions and the centred title */
  header: { title: 16, actions: 16 },
  listItem: {
    default: {
      leading: system.gap.leading,
      action: 16,
      description: system.gap.description,
      caption: system.gap.caption,
      topElement: system.gap.topElement
    },
    /* `trailing`: before the date and the unread dot; `tag`: above and between tags */
    messages: { leading: 8, trailing: system.gap.trailing, tag: 8 }
  },
  module: {
    leading: system.gap.leading,
    trailing: system.gap.trailing,
    topElement: system.gap.topElement
  },
  /* `items`: between the boxes; `error`: above the error message */
  otpInput: { items: 8, error: 4 },
  /* `control`: between the label and the checkbox, radio or switch */
  selection: {
    leading: system.gap.leading,
    control: system.gap.trailing,
    action: 8,
    description: system.gap.description,
    caption: system.gap.caption
  },
  /* `icon`: between the icon and the label; `items`: between tabs */
  tab: { icon: 4, items: 8 },
  tag: { leading: 6 },
  textInput: { leading: 8, trailing: system.gap.trailing },
  /* `stack`: between stacked toasts */
  toast: { trailing: 16, stack: 8 }
} as const satisfies Named<IOSpace>;

/* Figma: `Dimensions/Paddings/*` */
const componentPadding = {
  accordion: 16,
  alert: { default: 16, fullWidth: system.padding.screen.default },
  /* Space around the logo or the placeholder icon */
  avatar: {
    xsmall: { logo: 4, placeholder: 6 },
    small: { logo: 6, placeholder: 12 },
    medium: { logo: 8, placeholder: 16 }
  },
  badge: { horizontal: 8, vertical: 4 },
  banner: 16,
  /* Horizontal only: the height is fixed */
  button: { default: 24, fullWidth: 16 },
  footer: {
    vertical: 16,
    /* Below a link action, above the iPhone home indicator: the link has no fixed height */
    homeIndicator: 8,
    /* Replaced by the safe area inset, when there is one */
    bottom: system.padding.screen.default
  },
  listItem: {
    default: { horizontal: system.padding.screen.default, vertical: 12 },
    messages: { horizontal: system.padding.screen.messages, vertical: 12 }
  },
  module: { horizontal: 16, vertical: 16 },
  tab: { horizontal: 16, vertical: 8 },
  tag: { horizontal: 8, vertical: 6 },
  /* `floatingLabel`: above the typed text, room for the raised label (see `offset.textInput`) */
  textInput: { horizontal: 12, vertical: 8, floatingLabel: 16 },
  toast: 16,
  tooltip: 16
} as const satisfies Named<IODimensionScale>;

/* Figma: `Dimensions/Radius/*` */
const componentRadius = {
  accordion: system.radius.default,
  alert: system.radius.default,
  banner: system.radius.default,
  button: system.radius.default,
  module: system.radius.default,
  avatar: { xsmall: 6, small: 8, medium: 12 },
  bottomSheet: 24,
  badge: 24,
  otpInput: system.radius.default,
  selection: { control: 6 },
  /* Pill: above half the tab height */
  tab: 24,
  tag: 6,
  textInput: system.radius.default,
  toast: system.radius.default,
  tooltip: system.radius.default
} as const satisfies Named<IORadius>;

/* Figma: `Dimensions/Stroke/*` */
const componentStroke = {
  button: { outline: 2 },
  /* Empty and filled dots alike, so both keep the same size */
  codeInput: { dot: 2 },
  otpInput: {
    default: system.stroke.default,
    focused: system.stroke.focused
  },
  selection: { control: 2 },
  textInput: {
    default: system.stroke.default,
    focused: system.stroke.focused
  }
} as const satisfies Named<IODimensionScale>;

const componentIconSize = {
  accordion: system.size.icon.leading,
  alert: system.size.icon.leading,
  banner: system.size.icon.leading,
  button: { default: 20, link: 24 },
  featureInfo: system.size.icon.leading,
  listItem: system.size.icon.leading,
  module: { leading: system.size.icon.leading },
  selection: system.size.icon.leading,
  tab: 16,
  tag: 16,
  textInput: system.size.icon.leading,
  toast: 24
} as const satisfies Named<IOIconSize>;

const componentPictogramSize = {
  banner: 80,
  featureInfo: 48
} as const satisfies Named<IOPictogramSize>;

/* Component sizes, independent of every scale: values are not type-checked */
const componentSize = {
  avatar: { xsmall: 30, small: 44, medium: 66 },
  codeInput: { dot: 16 },
  iconButton: { small: 24, default: 48, large: 56 },
  /* Checkbox and radio control */
  selection: { control: 24 }
} as const;

const componentHeight = {
  button: 48,
  header: 56,
  textInput: 60
} as const;

const offset = {
  banner: { close: 8 },
  scrollDown: {
    right: system.padding.screen.default,
    bottom: system.padding.screen.default
  },
  /* `floatingLabel`: how far the label rises; tune with `padding.textInput.floatingLabel` */
  textInput: { floatingLabel: 12 },
  tooltip: { close: 8 }
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
    card: system.padding.card,
    ...componentPadding
  },
  radius: { scale: radiusScale, ...system.radius, ...componentRadius },
  stroke: { ...system.stroke, ...componentStroke },
  size: {
    icon: { scale: iconSize, ...system.size.icon, ...componentIconSize },
    pictogram: {
      scale: pictogramSize,
      ...system.size.pictogram,
      ...componentPictogramSize
    },
    touchTarget: system.size.touchTarget,
    ...componentSize
  },
  height: componentHeight,
  offset
} as const;
