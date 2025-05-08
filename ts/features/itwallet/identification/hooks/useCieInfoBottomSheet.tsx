import I18n from "../../../../i18n.ts";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet.tsx";

type CieInfoBottomSheetProps = {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

export const useCieInfoBottomSheet = ({
  onPrimaryAction,
  onSecondaryAction
}: CieInfoBottomSheetProps) =>
  useItwIdentificationBottomSheet({
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
        onPress: () => {
          onPrimaryAction();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.secondaryAction"
        ),
        onPress: () => {
          onSecondaryAction();
        }
      }
    ]
  });
