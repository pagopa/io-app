import {
  H3,
  HeaderSecondLevel,
  IOAppMargin,
  IOColors,
  IOVisualCostants,
  BodySmall
} from "@pagopa/io-app-design-system";
import { useLayoutEffect, memo, useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import {
  selectFiscalCodeFromEid,
  selectNameSurnameFromEid
} from "../../../credentials/store/selectors";
import { trackCredentialCardModal } from "../analytics";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";

/**
 * This magic number is the lenght of the encoded fiscal code in a CODE39 barcode.
 * It should be always the same as long as the fiscal code is always 16 characters long.
 * This is used to calculate the width of the barcode since the barcode library doesn't support
 * a max width parameter.
 */
const ENCODED_FISCAL_CODE_LENGTH_CODE39 = 288;

/**
 * Window height is used to calculate the width of the barcode rotated by 90 degrees.
 * Window width is used to calculate the height of the barcode to fit the screen.
 */
const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

/**
 * The available height is the height of the screen minus the height of the header and the vertical padding of the screen.
 */
const availableHeight =
  windowHeight - // Start with the height of the screen
  IOVisualCostants.headerHeight - // Removes the height of the header
  IOAppMargin[2] - // Removes the vertical padding of the fiscal code container
  IOAppMargin[4]; // Removes the vertical padding of the screen

/**
 * For aesthetics, we take the 90% of the available height.
 */
const barcodeTotalHeight = availableHeight * 0.9;

/**
 * The width of the barcode is 35% of the window width.
 * This is a magic number that looks good on landscape.
 */
const barcodeWidth = windowWidth * 0.35;

/**
 * Dispalys a full screen modal with the fiscal code.
 */
const ItwPresentationCredentialFiscalCodeModal = () => {
  const navigation = useIONavigation();
  const safeAreaInsets = useSafeAreaInsets();

  /**
   * Finally, barcodeWidth is calculated dividing the barcode container width minus the safe area insets by the encoded fiscal code length.
   */
  const barcodeHeigth =
    (barcodeTotalHeight - safeAreaInsets.top - safeAreaInsets.bottom) /
    ENCODED_FISCAL_CODE_LENGTH_CODE39;

  const nameSurname = useIOSelector(selectNameSurnameFromEid);
  const fiscalCode = useIOSelector(selectFiscalCodeFromEid);

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  useFocusEffect(
    useCallback(() => {
      trackCredentialCardModal("ITW_TS_V2");
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.landscape,
          {
            // Centers the barcode in the screen by removing the safe area top inset (if any)
            top: -safeAreaInsets.top
          }
        ]}
      >
        <View style={styles.container}>
          <BodySmall weight="Semibold" style={styles.text}>
            {nameSurname}
          </BodySmall>
          <Barcode
            value={fiscalCode}
            width={barcodeHeigth} // Since it is rotated by 90 degrees, we use the height as width
            height={barcodeWidth} // and the width as height
            format={"CODE39"} // CODE39 it's the encoding format used by the physical TS-CNS card
            background={IOColors.white}
            lineColor={IOColors.black}
          />
          <H3 style={styles.text}>{fiscalCode}</H3>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    paddingHorizontal: 8,
    paddingVertical: 32,
    rowGap: 4,
    borderColor: IOColors["grey-100"],
    // Always white regardless of the theme
    backgroundColor: IOColors.white,
    borderWidth: 1,
    borderRadius: 8
  },
  landscape: {
    transform: [{ rotate: "90deg" }]
  },
  text: {
    alignSelf: "center",
    // Always black regardless of the theme
    color: IOColors.black
  }
});

const MemoizedItwPresentationCredentialFiscalCodeModal = memo(
  ItwPresentationCredentialFiscalCodeModal
);

export { MemoizedItwPresentationCredentialFiscalCodeModal as ItwPresentationCredentialFiscalCodeModal };
