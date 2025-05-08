import { ContentWrapper, IOButton } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { useCieInfoBottomSheet } from "../../hooks/useCieInfoBottomSheet";
import { usePinBottomSheet } from "../../hooks/usePinBottomSheet";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";

type Props = {
  mode: "cie" | "pin";
};

const getPreparationContent = (
  mode: "cie" | "pin",
  presentCieSheet: () => void,
  presentPinSheet: () => void,
  sendEvent: (event: any) => void
) => ({
  title: I18n.t(
    `features.itWallet.identification.l3.mode.preparationScreen.${mode}.title`
  ),
  description: I18n.t(
    `features.itWallet.identification.l3.mode.preparationScreen.${mode}.content`
  ),
  buttonLink: {
    label: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${mode}.buttonLink`
    ),
    onPress: () => (mode === "cie" ? presentCieSheet() : presentPinSheet())
  },
  primaryAction: {
    label: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${mode}.primaryAction`
    ),
    accessibilityLabel: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${mode}.primaryAction`
    ),
    onPress: () =>
      sendEvent({
        type:
          mode === "cie" ? "acknowledged-cie-info" : "acknowledged-cie-pin-info"
      })
  },
  secondaryAction: {
    label: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${mode}.secondaryAction`
    ),
    accessibilityLabel: I18n.t(
      `features.itWallet.identification.l3.mode.preparationScreen.${mode}.secondaryAction`
    ),
    onPress: () => {
      // TODO
    }
  }
});

export const CiePreparationScreenContent = ({ mode }: Props) => {
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
    getPreparationContent(
      mode,
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
          accessibilityLabel: primaryAction.accessibilityLabel,
          onPress: primaryAction.onPress
        },
        secondary: {
          label: secondaryAction.label,
          accessibilityLabel: secondaryAction.accessibilityLabel,
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
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
