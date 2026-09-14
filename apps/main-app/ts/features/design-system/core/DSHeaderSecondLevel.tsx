import { Body, VSpacer } from "@io-app/design-system";

import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";

export const DSHeaderSecondLevel = () => (
  <IOScrollViewWithLargeHeader
    includeContentMargins
    title={{
      label: "Questo è un titolo lungo, ma lungo lungo davvero, eh!"
    }}
  >
    <VSpacer />
    {[...Array(50)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text</Body>
    ))}
  </IOScrollViewWithLargeHeader>
);
