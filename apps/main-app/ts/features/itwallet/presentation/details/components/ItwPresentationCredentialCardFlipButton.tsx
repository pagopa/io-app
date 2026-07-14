import { IOButton } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

type ItwPresentationCredentialCardFlipButtonProps = {
  fullScreen?: boolean;
  handleOnPress: () => void;
  isFlipped: boolean;
};

/** This component renders the flip button for the skeumorphic credential card */
const ItwPresentationCredentialCardFlipButton = ({
  isFlipped,
  handleOnPress,
  fullScreen = false
}: ItwPresentationCredentialCardFlipButtonProps) => (
  <View
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showBack"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: isFlipped }}
    accessible={true}
    style={fullScreen ? styles.fullWidthButton : styles.button}
  >
    <IOButton
      icon="switchCard"
      iconPosition="end"
      label={I18n.t(
        `features.itWallet.presentation.credentialDetails.card.${
          isFlipped ? "showFront" : "showBack"
        }`
      )}
      onPress={handleOnPress}
      variant={fullScreen ? "solid" : "link"}
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
