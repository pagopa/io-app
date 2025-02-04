import {
  H3,
  IOAppMargin,
  IOColors,
  useIOTheme,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import { memo } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import Barcode from "react-native-barcode-builder";
import Animated from "react-native-reanimated";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { selectFiscalCodeFromEid } from "../../../credentials/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

/**
 * This magic number is the lenght of the encoded fiscal code in a CODE39 barcode.
 * It should be always the same as long as the fiscal code is always 16 characters long.
 * This is used to calculate the width of the barcode since the barcode library doesn't support
 * a max width parameter.
 */
const ENCODED_FISCAL_CODE_LENGTH_CODE39 = 288;

/**
 * For the barcode width, we start from the window width and subtract the horizontal padding.
 */
const windowWidth = Dimensions.get("window").width;

/**
 * The total width is the window width minus the horizontal screen padding and the fiscal code button padding.
 */
const barcodeTotalWidth =
  windowWidth -
  IOAppMargin[4] - // Subtracting the horizontal screen padding
  IOAppMargin[3]; // Subtracting the fiscal code button padding

/**
 * The barcode width is the total width divided by the encoded fiscal code length.
 */
const barcodeWidth = barcodeTotalWidth / ENCODED_FISCAL_CODE_LENGTH_CODE39;

const ItwPresentationFiscalCode = () => {
  const navigation = useIONavigation();
  const theme = useIOTheme();
  const fiscalCode = useIOSelector(selectFiscalCodeFromEid);

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL
    });
  };

  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  return (
    <Pressable
      accessible={true}
      accessibilityRole="button"
      accessibilityHint={I18n.t(
        "features.itWallet.presentation.credentialDetails.fiscalCode.action"
      )}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.fiscalCode.label"
      )}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handleOnPress}
    >
      <Animated.View style={[styles.button, scaleAnimatedStyle]}>
        <Barcode
          value={fiscalCode}
          width={barcodeWidth}
          height={80}
          format={"CODE39"} // CODE39 it's the encoding format used by the physical TS-CNS card
          background={IOColors[theme["appBackground-primary"]]}
          lineColor={IOColors[theme["textBody-default"]]}
        />
        <H3 style={styles.fiscalCode}>{fiscalCode}</H3>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    rowGap: 0,
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    borderRadius: 8
  },
  fiscalCode: {
    alignSelf: "center"
  }
});

const MemoizedItwPresentationFiscalCode = memo(ItwPresentationFiscalCode);

export { MemoizedItwPresentationFiscalCode as ItwPresentationFiscalCode };
