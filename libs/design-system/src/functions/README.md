## Functions

These functions are primarily used to contain the logic of third-party libraries that have been wrapped up and exported for external use.

### `triggerHaptic`

This is the function that needs to be invoked in order to send haptic feedback to the device. The function exposes the underlying API of the [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback).

#### Usage

```jsx
import { triggerHaptic } from '@pagopa/io-app-design-system'

triggerHaptic('impactLight');
```