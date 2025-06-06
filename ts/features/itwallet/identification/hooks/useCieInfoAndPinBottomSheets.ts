import I18n from "i18n-js";
import { CieWarningType } from "../screens/ItwIdentificationCieWarningScreen";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

/**
 * Hook that manages the two bottom sheets used in the CIE identification flow:
 * - `cieInfoBottomSheet`: displays general information about the CIE
 * - `pinBottomSheet`: displays information about the CIE PIN
 */
export const useCieInfoAndPinBottomSheets = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const navigateToCieWarning = (warning: CieWarningType) => {
    machineRef.send({ type: "go-to-cie-warning", warning });
  };

  const cieInfoBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.content"
        )
      }
    ],
    imageSrc: require("../../../../../img/features/itWallet/identification/itw_cie_placeholder.png"),
    footerButtons: [
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.primaryAction"
        ),
        onPress: () => cieInfoBottomSheet.dismiss()
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.secondaryAction"
        ),
        onPress: () => {
          navigateToCieWarning("noCie");
          cieInfoBottomSheet.dismiss();
        }
      }
    ]
  });

  const pinBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.pin.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.content"
        )
      }
    ],
    imageSrc: require("../../../../../img/features/itWallet/identification/itw_cie_pin_placeholder.png"),
    footerButtons: [
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.primaryAction"
        ),
        onPress: () => pinBottomSheet.dismiss()
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.secondaryAction"
        ),
        onPress: () => {
          navigateToCieWarning("noPin");
          pinBottomSheet.dismiss();
        }
      }
    ]
  });

  return {
    cieInfoBottomSheet,
    pinBottomSheet
  };
};
