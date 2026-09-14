# Contexts

There are various various React contexts used by the library:
* `IODSExperimentalContext`: enable or disable experimental features. Previously used to test the new user interface, it is now available for custom experiments in some specific components.
* `IOThemeContext`: switch the app theme from light to dark and back again.
* `IONewTypefaceContext`: switch the typeface used in the components from the standard to the comfortable and back again.

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
import { IOThemeContext, useIOTheme } from "@pagopa/io-app-design-system";

const App = () => (
  <IOThemeContext.Provider value={IOThemes.light}>
    { */ …App code… */ }
  </IOThemeContext.Provider>
);

const MyComponent = () => {
  const theme = useIOTheme();

  return (
    <View style={{
      backgroundColor: theme["appBackground-primary"]
    }}>
      { */ …Component code… */ }
    </View>
  );
};
```