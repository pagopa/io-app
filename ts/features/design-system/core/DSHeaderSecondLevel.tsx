import * as React from "react";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { RNavScreenWithLargeHeader } from "../../../components/ui/RNavScreenWithLargeHeader";

export const DSHeaderSecondLevel = () => (
  <RNavScreenWithLargeHeader
    title={{
      label: "Questo è un titolo lungo, ma lungo lungo davvero, eh!"
    }}
  >
    <VSpacer />
    {[...Array(50)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text</Body>
    ))}
  </RNavScreenWithLargeHeader>
);
