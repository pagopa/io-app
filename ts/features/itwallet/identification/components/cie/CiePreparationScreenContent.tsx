import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useCallback, useMemo } from "react";
import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { EidIssuanceEvents } from "../../../machine/eid/events";
import { useCieInfoAndPinBottomSheets } from "../../hooks/useCieInfoAndPinBottomSheets";
import {
  trackItwCiePinTutorialCie,
  trackItwCiePinTutorialPin,
  trackItwUserWithoutL3Requirements
} from "../../../analytics";

type InfoType = "cie" | "ciePin";

type Props = { infoType: InfoType };

type GetContentParams = {
  infoType: InfoType;
  presentCieBottomSheet: () => void;
  presentPinBottomSheet: () => void;
  sendEvent: (event: EidIssuanceEvents) => void;
  routeName: string;
};

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

const getContent = ({
  infoType,
  presentCieBottomSheet,
  presentPinBottomSheet,
  sendEvent,
  routeName
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
          type: "next"
        })
    },
    secondaryAction: {
      label: I18n.t(
        `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.secondaryAction`
      ),
      onPress: () => {
        const warning = isCie ? "noCie" : "noPin";
        const reason = isCie ? "user_without_cie" : "user_without_pin";
        trackItwUserWithoutL3Requirements({
          screen_name: routeName,
          reason,
          position: "screen"
        });
        sendEvent({
          type: "go-to-cie-warning",
          warning
        });
      }
    },
    imageSource: isCie
      ? require("../../../../../../img/features/itWallet/identification/itw_cie_nfc.gif")
      : require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif")
  };
};

export const CiePreparationScreenContent = ({ infoType }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { name: routeName } = useRoute();

  const { cieInfoBottomSheet, pinBottomSheet } = useCieInfoAndPinBottomSheets();

  useFocusEffect(
    useCallback(() => {
      if (infoType === "ciePin") {
        trackItwCiePinTutorialPin();
      } else {
        trackItwCiePinTutorialCie();
      }
    }, [infoType])
  );

  const content = useMemo(
    () =>
      getContent({
        infoType,
        presentCieBottomSheet: cieInfoBottomSheet.present,
        presentPinBottomSheet: pinBottomSheet.present,
        sendEvent: machineRef.send,
        routeName
      }),
    [
      infoType,
      cieInfoBottomSheet.present,
      pinBottomSheet.present,
      machineRef.send,
      routeName
    ]
  );
  // Define image container height as 50% of screen height
  const imageHeightContainer = screenHeight * 0.5;

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
        <View style={[styles.imageContainer, { height: imageHeightContainer }]}>
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
