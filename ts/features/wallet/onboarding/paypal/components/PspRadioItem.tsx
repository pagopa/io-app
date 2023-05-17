// component that represents the item in the radio list
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { View, Dimensions, Image, StyleSheet } from "react-native";
import { H4 } from "../../../../../components/core/typography/H4";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { TestID } from "../../../../../types/WithTestID";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useImageResize } from "../../bancomat/screens/hooks/useImageResize";
import { IOPayPalPsp } from "../types";
import { Icon } from "../../../../../components/core/icons/Icon";
import { PspInfoBottomSheetContent } from "./PspInfoBottomSheet";

export const PSP_LOGO_MAX_WIDTH = Dimensions.get("window").width;
export const PSP_LOGO_MAX_HEIGHT = 32;
type RadioItemProps = {
  psp: IOPayPalPsp;
} & TestID;

const styles = StyleSheet.create({
  pspLogo: {
    height: 32,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  radioItemBody: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  radioItemRight: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  }
});

/**
 * item used in a radio list
 * it represents a PayPal psp with logo and info icon
 * @param props
 * @constructor
 */
export const PspRadioItem = (
  props: RadioItemProps
): React.ReactElement | null => {
  const { psp } = props;
  const imgDimensions = useImageResize(
    PSP_LOGO_MAX_WIDTH,
    PSP_LOGO_MAX_HEIGHT,
    psp.logoUrl
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <PspInfoBottomSheetContent
      pspFee={psp.fee}
      pspName={psp.name}
      pspPrivacyUrl={psp.privacyUrl}
    />,
    I18n.t("wallet.onboarding.paypal.selectPsp.infoBottomSheet.title", {
      pspName: psp.name
    }),
    Math.min(420, Dimensions.get("window").height),
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        testID: "continueButtonId",
        bordered: false,
        onPressWithGestureHandler: true,
        onPress: () => dismiss(),
        title: I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.ctaTitle"
        )
      }}
    />
  );

  return (
    <View style={styles.radioItemBody} testID={props.testID}>
      {/* show the psp name while its image is loading */}
      {pipe(
        imgDimensions,
        O.fold(
          () => (
            <H4
              weight={"SemiBold"}
              color={"bluegreyDark"}
              testID={"pspNameTestID"}
            >
              {psp.name}
            </H4>
          ),
          imgDim => (
            <Image
              testID={"pspNameLogoID"}
              source={{ uri: psp.logoUrl }}
              style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
              resizeMode={"contain"}
            />
          )
        )
      )}
      <View style={styles.radioItemRight}>
        <TouchableDefaultOpacity testID={"infoIconTestID"} onPress={present}>
          <Icon name="info" size={24} color="blue" />
        </TouchableDefaultOpacity>
      </View>
      {bottomSheet}
    </View>
  );
};
