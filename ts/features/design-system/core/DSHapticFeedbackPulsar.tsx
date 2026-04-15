import { IOButton, H4, VStack, useIOTheme } from "@pagopa/io-app-design-system";
import { Presets } from "react-native-pulsar";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const hapticFeedbacks: Array<{ label: string; fn: () => void }> = [
  { label: "impactLight", fn: Presets.System.impactLight },
  { label: "impactMedium", fn: Presets.System.impactMedium },
  { label: "impactHeavy", fn: Presets.System.impactHeavy },
  { label: "impactRigid", fn: Presets.System.impactRigid },
  { label: "impactSoft", fn: Presets.System.impactSoft },
  { label: "notificationSuccess", fn: Presets.System.notificationSuccess },
  { label: "notificationWarning", fn: Presets.System.notificationWarning },
  { label: "notificationError", fn: Presets.System.notificationError }
];

export const DSHapticFeedbackPulsar = () => {
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title={"Haptic Feedback (Pulsar)"}>
      <VStack space={16}>
        <H4 color={theme["textHeading-default"]}>Feedback</H4>
        <VStack space={16}>
          {hapticFeedbacks.map(({ label, fn }) => (
            <IOButton
              fullWidth
              variant="solid"
              key={label}
              label={label}
              onPress={fn}
            />
          ))}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
