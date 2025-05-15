import { IOButton } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n.ts";
import { ItwLogo } from "../../../common/components/ItwLogo.tsx";

type ItwPresentationCredentialCardFlipButtonProps = {
  isFlipped: boolean;
  handleOnPress: () => void;
  fullScreen?: boolean;
  isL3Enabled?: boolean;
};

/**
 * This component renders the flip button for the skeumorphic credential card
 */
const ItwPresentationCredentialCardFlipButton = ({
  isFlipped,
  handleOnPress,
  fullScreen = false,
  isL3Enabled = false
}: ItwPresentationCredentialCardFlipButtonProps) => {

  const rowStyle = fullScreen
    ? styles.fullWidthButton
    : isL3Enabled
      ? styles.row
      : styles.button;

  const shouldRenderLogo = !fullScreen && isL3Enabled;

  return (
  <View
    style={rowStyle}
    accessible={true}
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showBack"
    )}
    accessibilityRole="switch"
    accessibilityState={{checked: isFlipped}}
  >
    {shouldRenderLogo && <ItwLogo/>}

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
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "center"
  },
  row: {
    marginTop: 5,
    width: "88%",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between"
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
