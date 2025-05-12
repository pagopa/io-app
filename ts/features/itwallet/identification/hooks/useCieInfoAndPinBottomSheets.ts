import I18n from "../../../../i18n.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { CieWarningType } from "../screens/ItwIdentificationCieWarningScreen.tsx";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet.tsx";

/**
 * Hook that manages the two bottom sheets used in the CIE identification flow:
 * - `cieInfoBottomSheet`: displays general information about the CIE
 * - `pinBottomSheet`: displays information about the CIE PIN
 */
export const useCieInfoAndPinBottomSheets = () => {
  const navigation = useIONavigation();

  const navigateToCieWarning = (warning: CieWarningType) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE_WARNING,
      params: { warning }
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
