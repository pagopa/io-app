import { IOButton } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

type ItwPresentationCredentialCardHideValuesButtonProps = {
  handleOnPress: () => void;
  valuesHidden: boolean;
};

/**
 * This component renders the hide values button for the skeumorphic credential
 * card in full screen mode
 */
const ItwPresentationCredentialCardHideValuesButton = ({
  valuesHidden,
  handleOnPress
}: ItwPresentationCredentialCardHideValuesButtonProps) => (
  <View
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showValues"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: !valuesHidden }}
    accessible={true}
    style={styles.button}
  >
    <IOButton
      icon={valuesHidden ? "eyeShow" : "eyeHide"}
      iconPosition="end"
      label={I18n.t(
        `features.itWallet.presentation.credentialDetails.card.${
          valuesHidden ? "showValues" : "hideValues"
        }`
      )}
      onPress={handleOnPress}
      variant="link"
    />
  </View>
);

const styles = StyleSheet.create({
  button: {
    alignSelf: "center"
  }
});

export const MemoizedItwPresentationCredentialCardHideValuesButton = memo(
  ItwPresentationCredentialCardHideValuesButton
);

export { MemoizedItwPresentationCredentialCardHideValuesButton as ItwPresentationCredentialCardHideValuesButton };
