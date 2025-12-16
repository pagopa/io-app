import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";

export const DSHeaderSecondLevel = () => (
  <IOScrollViewWithLargeHeader
    title={{
      label: "Questo è un titolo lungo, ma lungo lungo davvero, eh!"
    }}
    includeContentMargins
  >
    <VSpacer />
    {[...Array(50)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text</Body>
    ))}
  </IOScrollViewWithLargeHeader>
);
