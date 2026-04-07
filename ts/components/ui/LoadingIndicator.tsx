import { LoadingSpinner } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ComponentProps } from "react";

import { WithTestID } from "../../types/WithTestID";

export type LoadingIndicator = WithTestID<
  Exclude<ComponentProps<typeof LoadingSpinner>, "color" | "duration" | "size">
>;

export const LoadingIndicator = ({
  accessibilityHint = I18n.t("global.accessibility.activityIndicator.hint"),
  accessibilityLabel = I18n.t("global.accessibility.activityIndicator.label"),
  testID = "LoadingIndicator"
}: LoadingIndicator) => (
  <LoadingSpinner
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    size={48}
    testID={testID}
  />
);
