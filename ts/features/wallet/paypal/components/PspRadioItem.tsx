// component that represents the item in the radio list
import React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { View } from "native-base";
import I18n from "../../../../i18n";
import { useIOBottomSheetRaw } from "../../../../utils/bottomSheet";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../components/core/typography/H4";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { PayPalPsp } from "../screen/PayPalPspSelectionScreen";
import { PspInfoBottomSheetContent } from "./PspInfoBottomSheet";

const PSP_LOGO_MAX_WIDTH = Dimensions.get("window").width;
const PSP_LOGO_MAX_HEIGHT = 32;
type RadioItemProps = {
  psp: PayPalPsp;
};

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
  radioItemRightContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  },
  radioItemRight: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  }
});

/**
 * item used in a radio list
 * it represent a PayPal psp with logo and info icon
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
  const pspInfoBottomSheet = useIOBottomSheetRaw(
    Math.min(470, Dimensions.get("window").height)
  );
  const handleInfoPress = () => {
    void pspInfoBottomSheet.present(
      <PspInfoBottomSheetContent
        onButtonPress={pspInfoBottomSheet.dismiss}
        pspFee={psp.fee}
        pspName={psp.name}
        pspPrivacyUrl={psp.privacyUrl}
      />,
      I18n.t("wallet.onboarding.paypal.selectPsp.infoBottomSheet.title", {
        pspName: psp.name
      })
    );
  };
  return (
    <View style={styles.radioItemBody}>
      {/* show the psp name while its image is loading */}
      {imgDimensions.fold<React.ReactNode>(
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {psp.name}
        </H4>,
        imgDim => (
          <Image
            source={{ uri: psp.logoUrl }}
            style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
            resizeMode={"contain"}
          />
        )
      )}
      <View style={styles.radioItemRightContainer}>
        <TouchableDefaultOpacity
          onPress={handleInfoPress}
          style={styles.radioItemRight}
        >
          <IconFont name={"io-info"} size={24} color={IOColors.blue} />
        </TouchableDefaultOpacity>
      </View>
    </View>
  );
};
