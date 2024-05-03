// component that represents the item in the radio list
import {
  ButtonSolid,
  ContentWrapper,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { H4 } from "../../../../../components/core/typography/H4";
import I18n from "../../../../../i18n";
import { TestID } from "../../../../../types/WithTestID";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { useImageResize } from "../../bancomat/hooks/useImageResize";
import { IOPayPalPsp } from "../types";
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

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "wallet.onboarding.paypal.selectPsp.infoBottomSheet.title",
        {
          pspName: psp.name
        }
      ),
      component: (
        <PspInfoBottomSheetContent
          pspFee={psp.fee}
          pspName={psp.name}
          pspPrivacyUrl={psp.privacyUrl}
        />
      ),
      footer: (
        <ContentWrapper>
          <ButtonSolid
            testID="continueButtonId"
            onPress={() => dismiss()}
            label={I18n.t(
              "wallet.onboarding.paypal.selectPsp.infoBottomSheet.ctaTitle"
            )}
            accessibilityLabel={I18n.t(
              "wallet.onboarding.paypal.selectPsp.infoBottomSheet.ctaTitle"
            )}
            fullWidth={true}
          />
          <VSpacer size={16} />
        </ContentWrapper>
      )
    },
    130
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
              accessibilityIgnoresInvertColors
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
