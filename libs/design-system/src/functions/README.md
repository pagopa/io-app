## Functions

These functions are primarily used to contain the logic of third-party libraries that have been wrapped up and exported for external use.

### `triggerHaptic`

This is the function that needs to be invoked in order to send haptic feedback to the device. It wraps the system presets of [`react-native-pulsar`](https://github.com/software-mansion/pulsar), accepting any key of `Presets.System` except the Android-only namespace.

#### Usage

```jsx
import { triggerHaptic } from '@pagopa/io-app-design-system'

triggerHaptic('impactLight');
```