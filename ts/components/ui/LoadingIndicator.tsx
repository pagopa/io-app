import * as React from "react";
import {
  LoadingSpinner,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { WithTestID } from "../../types/WithTestID";

export type LoadingIndicator = WithTestID<
  Exclude<
    React.ComponentProps<typeof LoadingSpinner>,
    "size" | "color" | "duration"
  >
>;

export const LoadingIndicator = ({
  accessibilityHint = I18n.t("global.accessibility.activityIndicator.hint"),
  accessibilityLabel = I18n.t("global.accessibility.activityIndicator.label"),
  testID = "LoadingIndicator"
}: LoadingIndicator) => {
  const { isExperimental } = useIOExperimentalDesign();

  return (
    <LoadingSpinner
      size={48}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      color={isExperimental ? "blueIO-500" : "blue"}
      testID={testID}
    />
  );
};
