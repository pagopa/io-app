import { IOButton } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";

type ItwPresentationCredentialCardFlipButtonProps = {
  isFlipped: boolean;
  handleOnPress: () => void;
  fullScreen?: boolean;
};

/**
 * This component renders the flip button for the skeumorphic credential card
 */
const ItwPresentationCredentialCardFlipButton = ({
  isFlipped,
  handleOnPress,
  fullScreen = false
}: ItwPresentationCredentialCardFlipButtonProps) => (
  <View
    style={fullScreen ? styles.fullWidthButton : styles.button}
    accessible={true}
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showBack"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: isFlipped }}
  >
    <IOButton
      variant={fullScreen ? "solid" : "link"}
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
  },
  fullWidthButton: {
    alignSelf: "stretch",
    marginHorizontal: "5%"
  }
});

export const MemoizedItwPresentationCredentialCardFlipButton = memo(
  ItwPresentationCredentialCardFlipButton
);

export { MemoizedItwPresentationCredentialCardFlipButton as ItwPresentationCredentialCardFlipButton };
