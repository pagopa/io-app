# Color tokens

How [`IOColors`](./index.ts) is built: what each group and name means, so a token reads the same way in code and in the design tool (Figma, etc…).

## Tiers

Each tier references only the one above it.

| Tier          | Meaning                                                                           | Example                                 |
| ------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| **Palette**   | Raw hues and steps, with no meaning ([`palette.ts`](./palette.ts))                | `IOColorPalette.blueIO[500]`            |
| **Semantic**  | A color by the role it plays, one value per mode ([`semantic.ts`](./semantic.ts)) | `colors.text.helper.error`              |
| **Component** | The semantic token each part of a component uses, by variant, role and state      | `colors.component.button.solid.primary` |

Components read the tokens of the current mode with `useIOColors()`. Each component declares its colors in its own `colors.ts`, registered in [`index.ts`](./index.ts).

## Semantic groups

Each group fills one component role (`background`, `foreground`, or `stroke` for a component's `border`). `background` and `foreground` are both a role and a group: the role includes the other groups listed with it.

| Role         | Group        | Holds                                                                                       |
| ------------ | ------------ | ------------------------------------------------------------------------------------------- |
| `background` | `background` | The whole screen                                                                            |
|              | `surface`    | What sits on the background: cards, alerts, pale tints. `surface.action`: interactive fills |
| `foreground` | `foreground` | Ink of components whose icon and text share a color (buttons, alerts)                       |
|              | `text`       | Text of components where icon and text differ (list items, tags)                            |
|              | `icon`       | Icons of components where icon and text differ                                              |
|              | `pictogram`  | Pictograms                                                                                  |
| `stroke`     | `stroke`     | Borders and dividers                                                                        |

## Ink names

Ink is named after what it sits on (`on<Background>`): a new solid background gets its own group, with whatever ink contrasts with it.

| Name       | Sits on                               | Example                                                    |
| ---------- | ------------------------------------- | ---------------------------------------------------------- |
| plain      | A neutral background or surface       | `text.helper.error`: red text on white                     |
| `onTint`   | The matching pale surface             | `foreground.onTint.error` on `surface.error`               |
| `onAccent` | `background.accent` (the blue screen) | `foreground.onAccent.default`: white                       |
| `onAction` | The matching `surface.action` fill    | `foreground.onAction.primary`: the label of a solid button |

A pale tint needs a dark ink of its own hue (`onTint`), the blue screen needs white (`onAccent`), a button fill needs the ink that contrasts with that fill (`onAction`), which can flip with the mode: the primary label is white in light mode, black in dark mode.

## States

`default`, `pressed` and `disabled` exist only in the `action` subgroups: `surface.action` for fills, `foreground.action` for ink. A component takes every state of one entry.

## Rules

- Each token is tagged with the component role it can fill: `background` (`background`, `surface`), `foreground` (`foreground`, `text`, `icon`, `pictogram`) or `stroke` (`stroke`, for a component's `border`). The types enforce it: `foreground: { default: colors.surface.default }` doesn't compile
- A component whose icon and text share a color takes `foreground`; one where they differ takes `icon` and `text`
- Components read the palette only in their own `colors.ts`, when no token fits and a new one would serve that component alone. Otherwise, add a token to the semantic layer
- Read tokens through their object, never destructured: `colors.text.content.default`, `listItemColors.label`. Every use reads as a token (review only, no lint rule)
- Alpha only through `withAlpha(token, opacity)`, with `opacity` from `IOOpacity.scale`: the result keeps the token's role
- Colors of a single feature live in that feature's own `colors.ts`, built from the palette
