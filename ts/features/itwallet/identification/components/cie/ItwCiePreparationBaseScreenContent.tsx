import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useCieInfoBottomSheet } from "../../hooks/useCieInfoBottomSheet";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";

export type CiePreparationType = "card" | "pin";

type Props = { type: CiePreparationType };

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

export const ItwCiePreparationBaseScreenContent = ({ type }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
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
      default:
        return undefined;
    }
  }, [type]);

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
        <IOButton
          variant="link"
          label={I18n.t(
            `features.itWallet.identification.cie.prepare.${type}.buttonLink`
          )}
          onPress={() => infoBottomSheet.present()}
        />
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
