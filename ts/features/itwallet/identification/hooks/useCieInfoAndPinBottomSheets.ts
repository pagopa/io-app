import { useRoute } from "@react-navigation/native";
import I18n from "../../../../i18n";
import { CieWarningType } from "../screens/ItwIdentificationCieWarningScreen";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItwCieInfoBottomSheet,
  trackItwPinInfoBottomSheet,
  trackItwUserWithoutL3Requirements
} from "../../analytics";

/**
 * Hook that manages the two bottom sheets used in the CIE identification flow:
 * - `cieInfoBottomSheet`: displays general information about the CIE
 * - `pinBottomSheet`: displays information about the CIE PIN
 */
export const useCieInfoAndPinBottomSheets = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { name: routeName } = useRoute();

  const navigateToCieWarning = (warning: CieWarningType) => {
    machineRef.send({ type: "go-to-cie-warning", warning });
    trackItwUserWithoutL3Requirements({
      screen_name: routeName,
      reason: warning === "noCie" ? "user_without_cie" : "user_without_pin",
      position: "bottom_sheet"
    });
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

  const originalCiePresent = cieInfoBottomSheet.present;
  cieInfoBottomSheet.present = () => {
    trackItwCieInfoBottomSheet({
      itw_flow: "L3",
      screen_name: routeName
    });
    originalCiePresent();
  };

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

  const originalPinPresent = pinBottomSheet.present;
  pinBottomSheet.present = () => {
    trackItwPinInfoBottomSheet({
      itw_flow: "L3",
      screen_name: routeName
    });
    originalPinPresent();
  };

  return {
    cieInfoBottomSheet,
    pinBottomSheet
  };
};
