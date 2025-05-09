import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { useCieInfoBottomSheet } from "../../hooks/useCieInfoBottomSheet";
import { usePinBottomSheet } from "../../hooks/usePinBottomSheet";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { EidIssuanceEvents } from "../../../machine/eid/events.ts";

type InfoType = "cie" | "pin";

type Props = { infoType: InfoType };

const getContent = (
  infoType: InfoType,
  presentCieBottomSheet: () => void,
  presentPinBottomSheet: () => void,
  sendEvent: (event: EidIssuanceEvents) => void
) => ({
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
    onPress: () =>
      infoType === "cie" ? presentCieBottomSheet() : presentPinBottomSheet()
  },
  primaryAction: {
    label: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.primaryAction`
    ),
    onPress: () =>
      sendEvent({
        type:
        infoType === "cie" ? "acknowledged-cie-info" : "acknowledged-cie-pin-info"
      })
  },
  secondaryAction: {
    label: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${infoType}.secondaryAction`
    ),
    onPress: () => {
      // TODO
    }
  }
  // imageSource: require("../../../../../../img/features/itWallet/identification/")
});

export const CiePreparationScreenContent = ({ infoType }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const cieInfoBottomSheet = useCieInfoBottomSheet({
    onPrimaryAction: () => cieInfoBottomSheet.dismiss(),
    onSecondaryAction: () => cieInfoBottomSheet.dismiss()
  });

  const pinBottomSheet = usePinBottomSheet({
    onPrimaryAction: () => pinBottomSheet.dismiss(),
    onSecondaryAction: () => pinBottomSheet.dismiss()
  });

  const { title, description, buttonLink, primaryAction, secondaryAction } =
    getContent(
      infoType,
      cieInfoBottomSheet.present,
      pinBottomSheet.present,
      machineRef.send
    );

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: title }}
      description={description}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "TwoButtons",
        primary: {
          label: primaryAction.label,
          onPress: primaryAction.onPress
        },
        secondary: {
          label: secondaryAction.label,
          onPress: secondaryAction.onPress
        }
      }}
    >
      <ContentWrapper>
        <IOButton
          variant="link"
          label={buttonLink.label}
          onPress={buttonLink.onPress}
        />
        {/**
        TODO: replace with the correct image when available
         If it's a gif, remember to add  "implementation 'com.facebook.fresco:animated-gif:3.6.0'"
        in android/app/build.gradle, otherwise it won't work on Android
        */}
        {/*         <Image
          source={imageSource}
        /> */}
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
