<div align="center">

<img alt="IO App Design System" src="repo-assets/io-app-design-system-github-cover.png" width="100%" style="max-width: 768px" /><br />

<h3 align="center">A comprehensive component library for <a href="https://github.com/pagopa/io-app">IO App</a></h3>

<a href="https://www.npmjs.com/package/@pagopa/io-app-design-system">
  <img alt="npm latest" src="https://img.shields.io/npm/v/@pagopa/io-app-design-system/latest.svg" />
</a>

</div>

---

# @pagopa/io-app-design-system

The IO App Design System library provides the complete set of design tokens, primitives, and UI components used by the [IO mobile app](../../apps/main-app/README.md). It lives inside the `pagopa/io-app` monorepo as the `libs/design-system` workspace package.

# Getting started

## Installing the component library (external consumers)
To add the component library to an external app run:

```bash
pnpm add @pagopa/io-app-design-system
```

Remember to encapsulate the app container with the `SafeAreaProvider` from [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context?tab=readme-ov-file#safeareaprovider) in your `App.tsx` file. Also, remember to apply this wrapper in other relevant places such as the root components of modals and routes when utilizing [`react-native-screens`](https://github.com/software-mansion/react-native-screens):
```js
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>...</SafeAreaProvider>;
}
```

## Playground
There is no standalone example app: current and new components are developed and tested inside the [main IO app](../../apps/main-app/README.md), under the [**Design System**](../../apps/main-app/ts/features/design-system) section (visible in developer mode). To launch it:

```bash
# From the repository root
corepack enable
corepack prepare --activate

# Install dependencies
pnpm install

# Install iOS pods (macOS only)
pnpm nx run main-app:dev-pod-install

# iOS
pnpm nx run main-app:run-ios

# Android
pnpm nx run main-app:dev-run-android
```

> [!important]
> Always test new components in the actual native environment. Browser-based rendering introduces technical trade-offs that do not reflect real usage conditions.

## Building the library
The library is built automatically as part of `pnpm install` via the `postinstall` hook (`nx prepack io-app-design-system`). To trigger a manual build:

```bash
pnpm nx run io-app-design-system:prepack
```

## Quality checks

```bash
# Type-check
pnpm nx tsc-noemit io-app-design-system

# Lint
pnpm nx lint io-app-design-system

# Tests
pnpm nx test io-app-design-system

# Format
pnpm prettify
```

# Usage
To try a component, just import it:

```tsx
import { IOButton } from '@pagopa/io-app-design-system';

// [...]

const MainScreen = () => (
  <View>
    <IOButton
      variant="solid"
      accessibilityLabel="Tap to trigger test alert"
      label="Hello world"
      onPress={() => Alert.alert("Alert", "Action triggered")}
    />
  </View>
);
```

# Architecture
The library is made up of several parts:

## Core
Essential core visual attributes of the design language. It includes:

- **`IOColors`**: Defines the main color palette, themes (light/dark) and other color-related utilities
- **`IOSpacing`**: Defines the main spacing scale and various component spacing attributes
- **`IOStyles`**: Defines common styles shared across components
- **`IOShapes`**: Defines visual shape-related attributes, such as radius
- **`IOAnimations`**: Defines common animation attributes used for interactive elements (used by the [`reanimated`](https://docs.swmansion.com/react-native-reanimated/) library)
- **`IOTransitions`**: Defines reusable custom enter/exit transitions (used by the [`reanimated`](https://docs.swmansion.com/react-native-reanimated/) library)

#### [Explore the `core` folder →](./src/core)

## Foundation
Essential atomic components:
* [**Typography**](./src/components/typography/) · [📖 Docs](./src/components/typography/README.md)
* [**Layout**](./src/components/layout/) · [📖 Docs](./src/components/layout/README.md)
  * [`ContentWrapper`](./src/components/layout/ContentWrapper.tsx)
  * [Stack (`VStack`, `HStack`)](./src/components/layout/Stack.tsx)
  * [Spacer (`VSpacer`,`HSpacing`)](./src/components/layout/Spacer.tsx)
  * [`Divider`](./src/components/layout/Divider.tsx)
  * [**[HowTo]** *Should I use `Stack` or `Spacer`?*  and other FAQs →](./src/components/layout/README.md#frequently-asked-questions)
* [**Icons**](./src/components/icons/) · [📖 Docs](./src/components/icons/README.md)
  * Assets with an intended size between `12px` and `56px`
  * [**[HowTo]** Add a new icon →](./src/components/icons/README.md#add-a-new-icon)
* [**Pictograms**](./src/components/pictograms/) · [📖 Docs](./src/components/pictograms/README.md)
  * Assets with an intended size greather than `56px`
  * [**[HowTo]** Add a new pictogram →](./src/components/pictograms/README.md#add-a-new-pictogram)
* [**Logos**](./src/components/logos/) · [📖 Docs](./src/components/logos/README.md)
  * [Payment Logos](./src/components/logos/)
  * [Avatar](./src/components/avatar/)
* **Loaders**
  * [`LoadingSpinner`](./src/components/loadingSpinner/)

## Components

* [**Buttons**](./src/components/buttons/)
  * [`IOButton`](./src/components/buttons/IOButton)
  * [`IconButton`](./src/components/buttons/IconButton.tsx)
  * [`IconButtonSolid`](./src/components/buttons/IconButtonSolid.tsx)
* [**TextInput**](./src/components/textInput/)
* [**List Items**](./src/components/listitems/)
  * [`ListItemAction`](./src/components/listitems/ListItemAction.tsx)
  * [`ListItemAmount`](./src/components/listitems/ListItemAmount.tsx)
  * [`ListItemHeader`](./src/components/listitems/ListItemHeader.tsx)
  * [`ListItemInfo`](./src/components/listitems/ListItemInfo.tsx)
  * [`ListItemInfoCopy`](./src/components/listitems/ListItemInfoCopy.tsx)
  * [`ListItemNav`](./src/components/listitems/ListItemNav.tsx)
  * [`ListItemNavAlert`](./src/components/listitems/ListItemNavAlert.tsx)
  * [`ListItemTransaction`](./src/components/listitems/ListItemTransaction.tsx)
* [**Modules**](./src/components/modules/)
  * [`ModuleAttachment`](./src/components/modules/ModuleAttachment.tsx)
  * [`ModuleCheckout`](./src/components/modules/ModuleCheckout.tsx)
  * [`ModuleCredential`](./src/components/modules/ModuleCredential.tsx)
  * [`ModuleIDP`](./src/components/modules/ModuleIDP.tsx)
  * [`ModuleNavigation`](./src/components/modules/ModuleNavigation.tsx)
  * [`ModuleNavigationAlt`](./src/components/modules/ModuleNavigationAlt.tsx)
  * [`ModulePaymentNotice`](./src/components/modules/ModulePaymentNotice.tsx)
  * [`ModuleSummary`](./src/components/modules/ModuleSummary.tsx)
* [**Badges**](./src/components/badge/) & [**Tags**](./src/components/tag/)
  * [`Badge`](./src/components/badge/Badge.tsx)
  * [`Tag`](./src/components/tag/Tag.tsx)
* **Selection**
  * [Checkbox](./src/components/checkbox/)
    * [`ListItemCheckbox`](./src/components/listitems/ListItemCheckbox.tsx)
    * [`CheckBoxLabel`](./src/components/checkbox/CheckboxLabel.tsx)
  * [Radio](./src/components/radio/)
    * [`ListItemRadio`](./src/components/listitems/ListItemRadio.tsx)
    * [`ListItemRadioWithAmount`](./src/components/listitems/ListItemRadioWithAmount.tsx)
    * [`RadioGroup`](./src/components/radio/RadioGroup.tsx)
  * [Switch](./src/components/switch/)
    * [`ListItemSwitch`](./src/components/listitems/ListItemSwitch.tsx)
    * [`NativeSwitch`](./src/components/switch/NativeSwitch.tsx)
* [**Accordion**](./src/components/accordion/)
  * [`AccordionItem`](./src/components/accordion/AccordionItem.tsx)
* [**Alert**](./src/components/alert/)
  * [`Alert`](./src/components/alert/Alert.tsx)
  * [`AlertEdgeToEdge`](./src/components/alert/AlertEdgeToEdge.tsx)
* **Advice & Banners**
  * [`FeatureInfo`](./src/components/featureInfo/)
  * [`Banner`](./src/components/banner/)
* [**Headers**](./src/components/headers/) · [📖 Docs](./src/components/headers/README.md)
  * [`HeaderFirstLevel`](./src/components/headers/HeaderFirstLevel.tsx)
  * [`HeaderSecondLevel`](./src/components/headers/HeaderSecondLevel.tsx)
  * [`ModalBSHeader`](./src/components/headers/ModalBSHeader.tsx)
* [**Templates**](./src/components/templates/) · [📖 Docs](./src/components/templates/README.md)
  * [`Dismissable`](./src/components/templates/Dismissable.tsx)
  * [`ForceScrollDownView`](./src/components/templates/ForceScrollDownView.tsx)

#### [Explore the `components` folder →](./src/components)

## Functions
Common functions used to wrap up external libraries and utilities

#### [Explore the `functions` folder →](./src/functions)

## Contexts

The contexts used in and exported from the library.

#### [Explore the `context` folder →](./src/context)

## Dependencies
The library requires the following peer dependencies to be installed by the consuming app:

* [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated) (`>=4.0.0`): Handles all the component animations
* [`react-native-worklets`](https://github.com/software-mansion/react-native-worklets): Runs the `reanimated` worklets
* [`react-native-svg`](https://github.com/software-mansion/react-native-svg): Handles all the vector asset components (icons, pictograms and logos)
* [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback): Handles all the haptic feedbacks
* [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context): Handles all safe area spacing attributes
* [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient)
* [`react-native-easing-gradient`](https://github.com/phamfoo/react-native-easing-gradient): Generates easing gradients
* [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler)

---

## Contributing

See the [contributing guide](../../CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT](../../LICENSE)
