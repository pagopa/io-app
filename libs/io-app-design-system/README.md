<div style="display: flex; flex-direction: column; align-items: center">

<img alt="IO App Design System" src="repo-assets/io-app-design-system-github-cover.png" width="100%" style="max-width: 768px" align="center" /><br />
<h3 align="center" style="width: 100%">A comprehensive library of components specifically designed for <a href="https://github.com/pagopa/io-app">IO App</a></h3>
<!-- NPM Badge -->
<div align="center">
<a href="https://www.npmjs.com/package/@pagopa/io-app-design-system"><img alt="npm latest package" src="https://img.shields.io/npm/v/@pagopa/io-app-design-system/latest.svg"></a>
</div>

<br />

</div>


# Getting started

## Prerequisites
To contribute to the library development, you will need to install `nodejs` and `yarn`. We recommend using [`nvm`](https://github.com/nvm-sh/nvm) to properly handle the supported nodejs version (see [`.nvmrc`](./.nvmrc)).
#### [Learn more about the `io-app` prerequisites →](https://github.com/pagopa/io-app#prerequisites)
## Installing the component library
To add the component library to the main app run:

```bash
yarn add @pagopa/io-app-design-system
```

Remember to encapsulate the app container with the `SafeAreaProvider` from [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context?tab=readme-ov-file#safeareaprovider) in your `App.tsx` file. Also, remember to apply this wrapper in other relevant places such as the root components of modals and routes when utilizing [`react-native-screens`](https://github.com/software-mansion/react-native-screens):
```js
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>...</SafeAreaProvider>;
}
```

## Launch the example app
For development purposes, a sample React Native application is included in the repository. To launch it:

```bash
# Move into `example` folder
cd example

# Install dependencies 
yarn install

# Install podfiles when targeting iOS (ignore this step for Android)
# Run this only during the first setup and when Pods dependencies change
cd iOS && bundle exec pod install

# Launch the app locally (simulator flag is optional)
yarn ios --simulator='iPhone 15 Pro'
```

### Playground
Consider the example app your playground when developing and testing current or new components. If you need to build new components, ensure that you test them in the same environment as our users, without making any technical trade-offs (like testing them in a browser)

> [!important]
> The sample application consists of several pages with some components for testing purposes. To view the [continuously updated Design System section](https://github.com/pagopa/io-app/tree/master/ts/features/design-system), please refer to the [main app](https://github.com/pagopa/io-app).


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
  * [**[HowTo]** Add a new icon →](./src/components/icons/#add-a-new-icon)
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
  * [`Alert`](./src/components//alert/Alert.tsx)
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


> [!important]
> If you want to test the above components in a real environment, please refer to the  [**Design System**](https://github.com/pagopa/io-app/tree/master/ts/features/design-system) section in the [main IO app](https://github.com/pagopa/io-app). Please be aware that certain components displayed in that section are exclusively accessible in the `io-app` repository.

#### [Explore the `components` folder →](./src/components)



## Functions
Common functions used to wrap up external libraries and utilities

#### [Explore the `functions` folder →](./src/functions)

## Contexts

The contexts used in and exported from the library.

#### [Explore the `context` folder →](./src/context)

## Dependencies
* [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated): Handles all the component animations
* [`react-native-svg`](https://github.com/software-mansion/react-native-svg): Handles all the vector asset components (icons, pictograms and logos)
* [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback): Handles all the haptic feedbacks
* [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context): Handles all safe area spacing attributes
* [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient)
* [`react-native-easing-gradient`](https://github.com/phamfoo/react-native-easing-gradient): Generates easing gradients
* [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler)

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
