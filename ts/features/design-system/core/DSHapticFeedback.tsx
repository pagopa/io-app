import {
  ButtonSolid,
  H4,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const hapticFeedbacks = [
  "impactLight",
  "impactMedium",
  "impactHeavy",
  "rigid",
  "soft",
  "notificationSuccess",
  "notificationWarning",
  "notificationError"
] as Array<Partial<HapticFeedbackTypes>>;

export const DSHapticFeedback = () => {
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title={"Haptic Feedback"}>
      <VStack space={16}>
        <H4 color={theme["textHeading-default"]}>Feedback</H4>
        <VStack space={16}>
          {hapticFeedbacks.map(feedback => (
            <ButtonSolid
              key={feedback}
              fullWidth
              label={feedback}
              onPress={() => ReactNativeHapticFeedback.trigger(feedback)}
              accessibilityLabel={feedback}
            />
          ))}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
