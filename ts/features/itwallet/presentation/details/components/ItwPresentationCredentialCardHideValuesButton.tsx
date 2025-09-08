import { IOButton } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";

type ItwPresentationCredentialCardHideValuesButtonProps = {
  valuesHidden: boolean;
  handleOnPress: () => void;
};

/**
 * This component renders the hide values button for the skeumorphic credential card in full screen mode
 */
const ItwPresentationCredentialCardHideValuesButton = ({
  valuesHidden,
  handleOnPress
}: ItwPresentationCredentialCardHideValuesButtonProps) => (
  <View
    style={styles.button}
    accessible={true}
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showValues"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: !valuesHidden }}
  >
    <IOButton
      variant="link"
      label={I18n.t(
        `features.itWallet.presentation.credentialDetails.card.${
          valuesHidden ? "showValues" : "hideValues"
        }`
      )}
      onPress={handleOnPress}
      icon={valuesHidden ? "eyeShow" : "eyeHide"}
      iconPosition="end"
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
