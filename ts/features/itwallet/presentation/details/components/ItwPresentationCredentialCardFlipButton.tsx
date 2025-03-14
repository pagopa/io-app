import {
  ButtonLink,
  ButtonLinkProps,
  ButtonSolid
} from "@pagopa/io-app-design-system";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n.ts";

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
}: ItwPresentationCredentialCardFlipButtonProps) => {
  const viewStyle = fullScreen ? styles.fullWidthButton : styles.button;

  const buttonProps: ButtonLinkProps = {
    label: I18n.t(
      `features.itWallet.presentation.credentialDetails.card.${
        isFlipped ? "showFront" : "showBack"
      }`
    ),
    onPress: handleOnPress,
    icon: "switchCard",
    iconPosition: "end"
  };

  return (
    <View
      style={viewStyle}
      accessible={true}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.card.showBack"
      )}
      accessibilityRole="switch"
      accessibilityState={{ checked: isFlipped }}
    >
      {fullScreen ? (
        <ButtonSolid {...buttonProps} />
      ) : (
        <ButtonLink {...buttonProps} />
      )}
    </View>
  );
};

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
