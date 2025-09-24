import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  trackItwCiePinTutorialCie,
  trackItwCiePinTutorialPin
} from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";

export type CiePreparationType = "card" | "pin" | "can";

type Props = { type: CiePreparationType };

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

export const ItwCiePreparationBaseScreenContent = ({ type }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const itw_flow = isL3FeaturesEnabled ? "L3" : "L2";
  const infoBottomSheet = useCieInfoBottomSheet({
    type,
    showSecondaryAction: isL3FeaturesEnabled
  });

  // Define image container height as 50% of screen height
  const imageHeightContainer = screenHeight * 0.5;

  const imageSrc = useMemo(() => {
    switch (type) {
      case "card":
        return require("../../../../../../img/features/itWallet/identification/itw_cie_nfc.gif");
      case "pin":
        return require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif");
      case "can":
        return require("../../../../../../img/features/itWallet/identification/cie_can.png");
      default:
        return undefined;
    }
  }, [type]);

  const infoButton = useMemo(() => {
    switch (type) {
      case "can":
        return null;
      default:
        return (
          <IOButton
            variant="link"
            label={I18n.t(
              `features.itWallet.identification.cie.prepare.${type}.buttonLink`
            )}
            onPress={() => infoBottomSheet.present()}
          />
        );
    }
  }, [type, infoBottomSheet]);

  useFocusEffect(
    useCallback(() => {
      const trackingMap: Record<CiePreparationType, () => void> = {
        card: () => trackItwCiePinTutorialCie(itw_flow),
        pin: () => trackItwCiePinTutorialPin(itw_flow),
        can: constNull
      };

      trackingMap[type]?.();
    }, [type, itw_flow])
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t(
          `features.itWallet.identification.cie.prepare.${type}.title`
        )
      }}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.${type}.content`
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(
            `features.itWallet.identification.cie.prepare.${type}.cta`
          ),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
    >
      <ContentWrapper>
        {infoButton}
        <View style={[styles.imageContainer, { height: imageHeightContainer }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={imageSrc}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
        {infoBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    marginTop: 15
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
