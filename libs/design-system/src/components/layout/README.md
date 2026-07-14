# Layout

Different layout components are available to help with screen composition:
* **`ContentWrapper`**: a basic `View` component with horizontal spacing applied to all screens by default. It is used to wrap the main content.
* **Stack**: `VStack` and `HStack` are used to add **uniform** vertical and horizontal spacing between components, respectively. They take advantage of the `flex` properties combined with the new `gap` property.
* **Spacer**: `VSpacer` and `HSpacer` are used to add **not-uniform** vertical and horizontal spacing between components, respectively. They are defined as `View` components with a fixed height or width.
* **`Divider`**: used to add a divider between screen blocks.

## Usage

### `ContentWrapper`

```jsx
import { ContentWrapper } from '@pagopa/io-app-design-system';

const Component = () => (
  <ContentWrapper>
   {/* […] */}
  </ContentWrapper>
);

const ComponentWithLargerMargin = () => (
  <ContentWrapper margin={24}>
   {/* […] */}
  </ContentWrapper>
);
```

### `VStack` and `HStack`

In the example below, the inner components are arranged with an equal uniform vertical space of 16 between them.

```jsx
import { VStack } from '@pagopa/io-app-design-system';

const ComponentWithInnerSpacing = () => (
  <VStack space={16}>
   {/* […] */}
  </VStack>
);
```

### `VSpacer` and `HSpacer`

```jsx
import { VSpacer, HSpacer } from '@pagopa/io-app-design-system';

const Component = () => (
  <View>
    {/* […] */}
    <VSpacer space={8} />
    {/* […] */}
    <VSpacer space={16} />
    {/* […] */}
  </View>
);

const ComponentWithHSpacer = () => (
  <View style={{
    flexDirection: 'row'
  }}>
    {/* […] */}
    <HSpacer />
    {/* […] */}
  </ View>
);
```

### `Divider`

```jsx
import { Divider } from '@pagopa/io-app-design-system';

const Component = () => (
  <Screen>
    {/* [First block] */}
    <Divider />
    {/* [Second block] */}
  </Screen>
);
```

## Frequently Asked Questions

### I need to add space between the components. Should I use `Stack` or `Spacer` components?

The `gap` property, on which the `Stack` components are based, is handled directly by React Native's layout engine. This means that:
- Native-level spacing calculation
- Better memory efficiency
- Faster layout computation

Unless you need to create a lot of nested `Stack` containers to reflect the design specs, you should probably use `Stack` instead of `Spacer`.
`Spacer` components are still available because they can be useful in specific edge cases.