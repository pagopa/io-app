import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* Ink shared by the list items; `amount` and `featured` of `ListItemRadioWithAmount` */
export const listItemColors = (s: IOColorSemantics) =>
  ({
    label: s.text.content.default,
    description: s.text.content.tertiary,
    icon: s.icon.decorative,
    amount: s.text.content.action,
    featured: s.foreground.featured
  }) satisfies Record<
    "amount" | "description" | "featured" | "icon" | "label",
    IOComponentColor<"foreground">
  >;
