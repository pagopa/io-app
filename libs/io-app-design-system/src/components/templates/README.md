# Templates

Although these templates do not provide specific instructions on how to build your screens, they offer a range of built-in features that can be easily integrated.

## `ForceScrollDownView`

A special `ScrollView` that includes a button which forces the page to scroll to the bottom.

### Usage

```jsx
import { ForceScrollDownView } from "@pagopa/io-app-design-system";

const SpecialPage = () => (
  <ForceScrollDownView>
    { /* [Screen content] */}
  </ForceScrollDownView>
);
```