# Dimension tokens

The naming adopted by [`IODimensions`](./index.ts): what each word means, so a token reads the same way in code and in relative design tool (Figma, etc…).

A token path reads as **property → context → variant → role, element or axis**, where every segment after the context is optional:

- `gap.listItem.messages.leading`: the _gap_ in the _list item_, _messages_ variant, after the _leading_ graphic
- `padding.avatar.medium.logo`: the _padding_ of the _avatar_, _medium_ size, around the _logo_
- `stroke.textInput.focused`: the _stroke_ of the _text input_, _focused_ state
- `padding.badge.horizontal`: the _padding_ of the _badge_, _horizontal_ axis

## Tiers

| Tier          | Meaning                                                                                                                   | Example                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Scale**     | Every value a property can take. `IODimensionScale` is the base ramp; each property has its own subset as a `scale` array | `gap.scale`, `radius.scale`      |
| **System**    | A value shared across components                                                                                          | `gap.trailing`, `radius.default` |
| **Component** | A value owned by one component, keyed by its name. Removing the component removes its keys too                            | `radius.tooltip`, `padding.tag`  |

### Component values

A component value is assigned in one of two ways:

| Assignment           | Meaning                                                                                      | Example                                 |
| -------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| **System reference** | Points to a system value: the component follows a design choice shared with other components | `radius.tooltip: system.radius.default` |
| **Direct value**     | A number: a deliberate exception, where the component needs its own dimension                | `radius.bottomSheet: 24`                |

## Glossary

### Properties

| Property  | Meaning                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `gap`     | Space **between** two elements, inside a component or between sibling components                        |
| `padding` | Space **inside** a container, between its edge and its content                                          |
| `radius`  | Corner radius                                                                                           |
| `stroke`  | Border width                                                                                            |
| `size`    | Square dimension (icons, pictograms, avatars, etc…)                                                     |
| `height`  | Single-axis dimension (buttons, headers, text inputs, etc…)                                             |
| `offset`  | Position of an absolutely positioned element from its container's edge (close buttons, floating labels) |

### System sizes

| Token                   | Use                                                                 |
| ----------------------- | ------------------------------------------------------------------- |
| `size.icon.leading`     | The icon in the leading position of a row                           |
| `size.icon.chevron`     | The navigation chevron, the same everywhere                         |
| `size.icon.caption`     | The small icon preceding a caption                                  |
| `size.pictogram.screen` | Pictogram leading a result or empty-state screen                    |
| `size.pictogram.inline` | Pictogram leading an empty or error state inside a section or sheet |
| `size.touchTarget`      | The minimum touch area of an interactive element                    |

### Gap roles

Read along the reading direction of a row or a column.

| Role          | Space between…                                                      | System |
| ------------- | ------------------------------------------------------------------- | ------ |
| `leading`     | The leading graphic (icon, logo, avatar, pictogram) and the content | ✓      |
| `trailing`    | The content and a trailing element on the same row                  | ✓      |
| `control`     | The label and a selection control (checkbox, radio, switch)         |        |
| `description` | A label and its description below                                   | ✓      |
| `caption`     | A caption icon and its small text                                   | ✓      |
| `topElement`  | An element above the content (e.g. a badge) and the content         | ✓      |
| `action`      | The content and an action (button, link) attached to it             |        |
| `actions`     | Two actions next to each other or stacked                           |        |
| `items`       | Repeated items of the same kind (tabs, dots, etc…)                  |        |
| `icon`        | An icon and the label it sits next to, inside a button or a tab     |        |
| `error`       | The component and its error message                                 |        |
| `title`       | The side actions and a centred title (headers)                      |        |
| `link`        | The previous element and a link button                              |        |

### Contexts

Where the value applies: a component name (`tooltip`, `listItem`, `textInput`), or one of these shared contexts.

| Context     | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| `screen`    | The screen itself (see [Screen paddings](#screen-paddings))       |
| `card`      | Card surfaces (payment, CGN, featured services…)                  |
| `selection` | Selection list items and their controls (checkbox, radio, switch) |

### Variants

Which version of the context the value belongs to. `default` is the standard one of each kind.

| Kind   | Names                                | Meaning                                                                  |
| ------ | ------------------------------------ | ------------------------------------------------------------------------ |
| Size   | `xsmall`, `small`, `medium`, `large` | The size variant of the component (`avatar`, `iconButton`)               |
| Layout | `default`, `fullWidth`, `messages`   | Standard, spanning the whole screen width, denser for the messages inbox |
| State  | `default`, `focused`                 | Resting and focused state of an input                                    |

### Elements

The part of the component the value applies to, when it isn't the component as a whole.

| Element         | Meaning                                                |
| --------------- | ------------------------------------------------------ |
| `close`         | The close button of a dismissable component            |
| `control`       | The checkbox or radio control                          |
| `dot`           | A single dot of the code input                         |
| `floatingLabel` | The label of a text input, raised above the typed text |
| `homeIndicator` | The space left above the iPhone home indicator         |
| `logo`          | The logo inside an avatar                              |
| `placeholder`   | The placeholder icon inside an avatar                  |
| `outline`       | The border of an outline button                        |

### Axes

| Axis                                | Meaning                                    |
| ----------------------------------- | ------------------------------------------ |
| `horizontal` / `vertical`           | One axis of a padding, when the two differ |
| `top` / `right` / `bottom` / `left` | The edge a value is measured from          |

### Screen paddings

Paddings of a screen, under `padding.screen`.

#### Horizontal

| Name       | Use                                                          |
| ---------- | ------------------------------------------------------------ |
| `default`  | Every standard screen                                        |
| `messages` | The messages inbox, whose list items sit closer to the edges |
| `heroCard` | Large cards leading a screen (e.g. bonus cards)              |
| `centred`  | Centred, pictogram-led content, to keep centred lines short  |

#### Vertical

| Name  | Use                                                 |
| ----- | --------------------------------------------------- |
| `end` | Space below the last element of a scrollable screen |
