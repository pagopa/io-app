import {
  H3,
  IOAppMargin,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import React from "react";
import { LayoutChangeEvent, Pressable, StyleSheet } from "react-native";
import Barcode from "react-native-barcode-builder";
import Animated from "react-native-reanimated";
import { useScaleAnimation } from "../../../../components/ui/utils/hooks/useScaleAnimation";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { selectFiscalCodeFromEid } from "../../credentials/store/selectors";

/**
 * This magic number is the lenght of the encoded fiscal code in a CODE39 barcode.
 * It should be always the same as long as the fiscal code is always 16 characters long.
 * This is used to calculate the width of the barcode since the barcode library doesn't support
 * a max width parameter.
 */
const ENCODED_FISCAL_CODE_LENGTH_CODE39 = 288;

const ItwPresentationFiscalCode = () => {
  const fiscalCode = useIOSelector(selectFiscalCodeFromEid);
  const theme = useIOTheme();
  const [barCodeWidth, setBarCodeWidth] = React.useState(1);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setBarCodeWidth(
      (width - IOAppMargin[3]) / // Subtracting the horizontal padding which is 16 but has to be multiplied by 2 for each side
        ENCODED_FISCAL_CODE_LENGTH_CODE39
    );
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
    >
      <Animated.View
        style={[styles.button, scaleAnimatedStyle]}
        onLayout={handleLayout}
      >
        <Barcode
          value={fiscalCode}
          width={barCodeWidth}
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
    padding: 16,
    rowGap: 8,
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    borderRadius: 8
  },
  fiscalCode: {
    alignSelf: "center"
  }
});

const MemoizedItwPresentationFiscalCode = React.memo(ItwPresentationFiscalCode);

export { MemoizedItwPresentationFiscalCode as ItwPresentationFiscalCode };
