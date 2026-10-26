import { Body, H2, VSpacer } from "@io-app/design-system";

import { IOScrollView } from "../../../components/ui/IOScrollView";

export const DSIOScrollViewWithoutActions = () => (
  <IOScrollView>
    <H2>Start</H2>
    <VSpacer />
    {[...Array(50)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text {i + 1}</Body>
    ))}
    <VSpacer />
    <H2>End</H2>
  </IOScrollView>
);
