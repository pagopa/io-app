import * as React from "react";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { ScrollableScreenContent } from "../../../components/ui/ScrollableScreenContent";

export const DSHeaderSecondLevel = () => (
  <ScrollableScreenContent title="Questo è un titolo lungo, ma lungo lungo davvero, eh!">
    <VSpacer />
    {[...Array(50)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text</Body>
    ))}
  </ScrollableScreenContent>
);
