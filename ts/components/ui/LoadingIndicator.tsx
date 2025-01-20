import { LoadingSpinner } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";
import { useInteractiveElementDefaultColor } from "../../utils/hooks/theme";

export type LoadingIndicator = WithTestID<
  Exclude<ComponentProps<typeof LoadingSpinner>, "size" | "color" | "duration">
>;

export const LoadingIndicator = ({
  accessibilityHint = I18n.t("global.accessibility.activityIndicator.hint"),
  accessibilityLabel = I18n.t("global.accessibility.activityIndicator.label"),
  testID = "LoadingIndicator"
}: LoadingIndicator) => {
  const blueColor = useInteractiveElementDefaultColor();

  return (
    <LoadingSpinner
      size={48}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      color={blueColor}
      testID={testID}
    />
  );
};
