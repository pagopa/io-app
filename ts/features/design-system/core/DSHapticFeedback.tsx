import * as React from "react";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";

import { IOThemeContext } from "../../../components/core/variables/IOColors";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSHapticFeedback = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title={"Haptic Feedback"}>
        <H2 color={theme["textHeading-default"]}>Feedbacks</H2>
        <VSpacer size={24} />
        <ButtonOutline
          fullWidth
          label="impactLight"
          onPress={() => ReactNativeHapticFeedback.trigger("impactLight")}
          accessibilityLabel="impactLight"
          accessibilityHint="impactLight"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="impactMedium"
          onPress={() => ReactNativeHapticFeedback.trigger("impactMedium")}
          accessibilityLabel="impactMedium"
          accessibilityHint="impactMedium"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="impactHeavy"
          onPress={() => ReactNativeHapticFeedback.trigger("impactHeavy")}
          accessibilityLabel="impactHeavy"
          accessibilityHint="impactHeavy"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="rigid"
          onPress={() => ReactNativeHapticFeedback.trigger("rigid")}
          accessibilityLabel="rigid"
          accessibilityHint="rigid"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="soft"
          onPress={() => ReactNativeHapticFeedback.trigger("soft")}
          accessibilityLabel="soft"
          accessibilityHint="soft"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="notificationSuccess"
          onPress={() =>
            ReactNativeHapticFeedback.trigger("notificationSuccess")
          }
          accessibilityLabel="notificationSuccess"
          accessibilityHint="notificationSuccess"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="notificationWarning"
          onPress={() =>
            ReactNativeHapticFeedback.trigger("notificationWarning")
          }
          accessibilityLabel="notificationWarning"
          accessibilityHint="notificationWarning"
        />
        <VSpacer />
        <ButtonOutline
          fullWidth
          label="notificationError"
          onPress={() => ReactNativeHapticFeedback.trigger("notificationError")}
          accessibilityLabel="notificationError"
          accessibilityHint="notificationError"
        />
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);
