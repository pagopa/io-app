import { ButtonLink } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n.ts";

type ItwPresentationCredentialCardFlipButtonProps = {
  isFlipped: boolean;
  handleOnPress: () => void;
};

/**
 * This component renders the flip button for the skeumorphic credential card
 */
const ItwPresentationCredentialCardFlipButton = ({
  isFlipped,
  handleOnPress
}: ItwPresentationCredentialCardFlipButtonProps) => (
  <View
    style={styles.button}
    accessible={true}
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showBack"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: isFlipped }}
  >
    <ButtonLink
      label={I18n.t(
        `features.itWallet.presentation.credentialDetails.card.${
          isFlipped ? "showFront" : "showBack"
        }`
      )}
      onPress={handleOnPress}
      icon="switchCard"
      iconPosition="end"
    />
  </View>
);

const styles = StyleSheet.create({
  button: {
    alignSelf: "center"
  }
});

export const MemoizedItwPresentationCredentialCardFlipButton = memo(
  ItwPresentationCredentialCardFlipButton
);

export { MemoizedItwPresentationCredentialCardFlipButton as ItwPresentationCredentialCardFlipButton };
