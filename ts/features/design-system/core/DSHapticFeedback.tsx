import { IOButton, H4, VStack, useIOTheme } from "@pagopa/io-app-design-system";
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
            <IOButton
              fullWidth
              variant="solid"
              key={feedback}
              label={feedback}
              onPress={() => ReactNativeHapticFeedback.trigger(feedback)}
            />
          ))}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
