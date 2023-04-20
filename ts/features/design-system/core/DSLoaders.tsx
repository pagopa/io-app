import * as React from "react";
import { IOColors } from "../../../components/core/variables/IOColors";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import I18n from "../../../i18n";
import { H2 } from "../../../components/core/typography/H2";
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSLoaders = () => (
  <DesignSystemScreen title={"Loaders"}>
    {/* Present in the main Messages screen */}
    <H2>Activity Indicator</H2>
    <VSpacer size={40} />
    <ActivityIndicator
      animating={true}
      size={"large"}
      color={IOColors.blue}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
      testID={"activityIndicator"}
    />
    <VSpacer size={40} />
  </DesignSystemScreen>
);
