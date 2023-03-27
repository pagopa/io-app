import * as React from "react";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";

import { IOThemeContext } from "../../../components/core/variables/IOColors";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSHapticFeedback = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title={"Haptic Feedback"}>
        <H2 color={theme["textHeading-default"]}>Feedbacks</H2>
        <VSpacer size={24} />
        <ButtonSolid
          fullWidth
          label="impactLight"
          onPress={() => ReactNativeHapticFeedback.trigger("impactLight")}
          accessibilityLabel="impactLight"
          accessibilityHint="impactLight"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="impactMedium"
          onPress={() => ReactNativeHapticFeedback.trigger("impactMedium")}
          accessibilityLabel="impactMedium"
          accessibilityHint="impactMedium"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="impactHeavy"
          onPress={() => ReactNativeHapticFeedback.trigger("impactHeavy")}
          accessibilityLabel="impactHeavy"
          accessibilityHint="impactHeavy"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="rigid"
          onPress={() => ReactNativeHapticFeedback.trigger("rigid")}
          accessibilityLabel="rigid"
          accessibilityHint="rigid"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="soft"
          onPress={() => ReactNativeHapticFeedback.trigger("soft")}
          accessibilityLabel="soft"
          accessibilityHint="soft"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="notificationSuccess"
          onPress={() =>
            ReactNativeHapticFeedback.trigger("notificationSuccess")
          }
          accessibilityLabel="notificationSuccess"
          accessibilityHint="notificationSuccess"
        />
        <VSpacer />
        <ButtonSolid
          fullWidth
          label="notificationWarning"
          onPress={() =>
            ReactNativeHapticFeedback.trigger("notificationWarning")
          }
          accessibilityLabel="notificationWarning"
          accessibilityHint="notificationWarning"
        />
        <VSpacer />
        <ButtonSolid
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
