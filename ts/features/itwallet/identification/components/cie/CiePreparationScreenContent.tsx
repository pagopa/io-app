import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { EidIssuanceEvents } from "../../../machine/eid/events.ts";
import { useCieInfoAndPinBottomSheets } from "../../hooks/useCieInfoAndPinBottomSheets.ts";

type InfoType = "cie" | "ciePin";

type Props = { infoType: InfoType };

type GetContentParams = {
  infoType: InfoType;
  presentCieBottomSheet: () => void;
  presentPinBottomSheet: () => void;
  sendEvent: (event: EidIssuanceEvents) => void;
};

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

const getContent = ({
  infoType,
  presentCieBottomSheet,
  presentPinBottomSheet,
  sendEvent
}: GetContentParams) => {
  const isCie = infoType === "cie";

  return {
    title: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.title`
    ),
    description: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.content`
    ),
    buttonLink: {
      label: I18n.t(
        `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.buttonLink`
      ),
      onPress: () => (isCie ? presentCieBottomSheet() : presentPinBottomSheet())
    },
    primaryAction: {
      label: I18n.t(
        `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.primaryAction`
      ),
      onPress: () =>
        sendEvent({
          type: isCie ? "acknowledged-cie-info" : "acknowledged-cie-pin-info"
        })
    },
    secondaryAction: {
      label: I18n.t(
        `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.secondaryAction`
      ),
      onPress: () =>
        sendEvent({
          type: "go-to-cie-warning",
          warning: isCie ? "noCie" : "noPin"
        })
    },
    imageSource: isCie
      ? require("../../../../../../img/features/itWallet/identification/itw_cie_nfc.gif")
      : require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif")
  };
};

export const CiePreparationScreenContent = ({ infoType }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const { cieInfoBottomSheet, pinBottomSheet } = useCieInfoAndPinBottomSheets();

  const content = getContent({
    infoType,
    presentCieBottomSheet: cieInfoBottomSheet.present,
    presentPinBottomSheet: pinBottomSheet.present,
    sendEvent: machineRef.send
  });
  // Define image container height as 50% of screen height
  const imageHeight = screenHeight * 0.5;

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: content.title }}
      description={content.description}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "TwoButtons",
        primary: content.primaryAction,
        secondary: content.secondaryAction
      }}
    >
      <ContentWrapper>
        <IOButton
          variant="link"
          label={content.buttonLink.label}
          onPress={content.buttonLink.onPress}
        />
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={content.imageSource}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
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
