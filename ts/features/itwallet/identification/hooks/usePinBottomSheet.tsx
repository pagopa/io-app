import I18n from "../../../../i18n.ts";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet.tsx";

type PinBottomSheetProps = {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

export const usePinBottomSheet = ({
  onPrimaryAction,
  onSecondaryAction
}: PinBottomSheetProps) =>
  useItwIdentificationBottomSheet({
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
    // TODO: replace with the correct image when available
    imageSrc: require("../../../../../img/features/itWallet/identification/itw_cie_pin_placeholder.png"),
    footerButtons: [
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.primaryAction"
        ),
        onPress: () => {
          onPrimaryAction();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.secondaryAction"
        ),
        onPress: () => {
          onSecondaryAction();
        }
      }
    ]
  });
