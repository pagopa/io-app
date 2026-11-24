# Contexts

There are various various React contexts used by the library:

- `IODSExperimentalContext`: enable or disable experimental features. Previously used to test the new user interface, it is now available for custom experiments in some specific components.
- `IOThemeContext`: switch the app theme from light to dark and back again.
- `IONewTypefaceContext`: switch the typeface used in the components from the standard to the comfortable and back again.
- `IOSwitchAccessContext`: share Switch Access status across components.

### `IOSwitchAccessContext`

Wrap the application once in `IOSwitchAccessContextProvider`. It checks the
native Switch Access status on mount and when the app returns to the foreground,
then shares the value with every `useSwitchAccessEnabled` consumer.

```jsx
import {
  IOSwitchAccessContextProvider,
  useSwitchAccessEnabled
} from "@io-app/design-system";

const App = () => (
  <IOSwitchAccessContextProvider>
    {/* …App code… */}
  </IOSwitchAccessContextProvider>
);

const MyComponent = () => {
  const isSwitchAccessEnabled = useSwitchAccessEnabled();
  // …
};
```

## Usage

### `IODSExperimentalContext`

```jsx
import { IODSExperimentalContextProvider, useIODSExperimentalContext } from "@pagopa/io-app-design-system";

const App = () => (
  <IODSExperimentalContextProvider isExperimentaEnabled={true}>
    { */ …App code… */ }
  </IODSExperimentalContextProvider>
);

const MyComponent = () => {
  const { isExperimentalEnabled, setIsExperimentalEnabled } = useIODSExperimentalContext();

  return (
    <View>
      <Text>Experimental features are {isExperimentalEnabled ? "enabled" : "disabled"}</Text>
      <Button onPress={() => setIsExperimentalEnabled(!isExperimentalEnabled)}>
        <Text>Toggle experimental features</Text>
      </Button>
    </View>
  );
};
```

### `IOThemeContext`

```jsx
import { IOThemeContextProvider, useIOColors } from "@pagopa/io-app-design-system";

const App = () => (
  <IOThemeContextProvider theme="light">
    { */ …App code… */ }
  </IOThemeContextProvider>
);

const MyComponent = () => {
  const colors = useIOColors();

  return (
    <View style={{
      backgroundColor: colors.background.default
    }}>
      { */ …Component code… */ }
    </View>
  );
};
```
