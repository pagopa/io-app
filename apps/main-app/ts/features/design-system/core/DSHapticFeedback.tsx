import {
  H4,
  HapticType,
  IOButton,
  triggerHaptic,
  useIOTheme,
  VStack
} from "@io-app/design-system";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const hapticFeedbacks: Array<HapticType> = [
  "impactLight",
  "impactMedium",
  "impactHeavy",
  "impactRigid",
  "impactSoft",
  "notificationSuccess",
  "notificationWarning",
  "notificationError",
  "selection"
];

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
              key={feedback}
              label={feedback}
              onPress={() => triggerHaptic(feedback)}
              variant="solid"
            />
          ))}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
