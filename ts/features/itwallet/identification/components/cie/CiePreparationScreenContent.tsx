import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useCieInfoBottomSheet } from "../../hooks/useCieInfoBottomSheet";

type InfoCategory = "card" | "pin";

type Props = { category: InfoCategory };

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

export const CiePreparationScreenContent = ({ category }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const infoBottomSheet = useCieInfoBottomSheet(category);

  // Define image container height as 50% of screen height
  const imageHeightContainer = screenHeight * 0.5;

  const imageSrc = useMemo(() => {
    switch (category) {
      case "card":
        return require("../../../../../../img/features/itWallet/identification/itw_cie_nfc.gif");
      case "pin":
        return require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif");
      default:
        return undefined;
    }
  }, [category]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t(
          `features.itWallet.identification.cie.prepare.${category}.title`
        )
      }}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.${category}.content`
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(
            `features.itWallet.identification.cie.prepare.${category}.cta`
          ),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
    >
      <ContentWrapper>
        <IOButton
          variant="link"
          label={I18n.t(
            `features.itWallet.identification.cie.prepare.${category}.buttonLink`
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
