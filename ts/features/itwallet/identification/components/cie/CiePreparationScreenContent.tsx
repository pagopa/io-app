import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { EidIssuanceEvents } from "../../../machine/eid/events.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { CieWarningType } from "../../screens/ItwIdentificationCieWarningScreen.tsx";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { useCieInfoAndPinBottomSheets } from "../../hooks/useCieInfoAndPinBottomSheets.ts";

type InfoType = "cie" | "pin";

type Props = { infoType: InfoType };

type GetContentParams = {
  infoType: InfoType;
  presentCieBottomSheet: () => void;
  presentPinBottomSheet: () => void;
  sendEvent: (event: EidIssuanceEvents) => void;
  navigateToCieWarning: (warning: CieWarningType) => void;
};

const getContent = ({
  infoType,
  presentCieBottomSheet,
  presentPinBottomSheet,
  sendEvent,
  navigateToCieWarning
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
      onPress: () => navigateToCieWarning(isCie ? "noCie" : "noPin")
    }
    // imageSource: require("../../../../../../img/features/itWallet/identification/")
  };
};

export const CiePreparationScreenContent = ({ infoType }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const { cieInfoBottomSheet, pinBottomSheet } = useCieInfoAndPinBottomSheets();

  const navigation = useIONavigation();

  const navigateToCieWarning = (warning: CieWarningType) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE_WARNING,
      params: {
        warning
      }
    });
  };

  const content = getContent({
    infoType,
    presentCieBottomSheet: cieInfoBottomSheet.present,
    presentPinBottomSheet: pinBottomSheet.present,
    sendEvent: machineRef.send,
    navigateToCieWarning
  });

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
        {/**
        TODO: [SIW-2361] Replace with the correct image when available
         If it's a gif, remember to add  "implementation 'com.facebook.fresco:animated-gif:3.6.0'"
        in android/app/build.gradle, otherwise it won't work on Android
        */}
        {/*
        <Image
          source={imageSource}
        /> */}
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
