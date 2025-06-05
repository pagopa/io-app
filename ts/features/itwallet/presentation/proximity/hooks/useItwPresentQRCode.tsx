import { useEffect } from "react";
import {
  Body,
  IOVisualCostants,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import QRCode from "react-native-qrcode-svg";
import { Dimensions } from "react-native";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  selectShouldPresentQRCodeBottomSheet,
  selectQRCodeString
} from "../machine/selectors";
import I18n from "../../../../../i18n";

const QR_WIDTH =
  Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

export const useItwPresentQRCode = () => {
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const shouldPresentQRCodeBottomSheet = ItwProximityMachineContext.useSelector(
    selectShouldPresentQRCodeBottomSheet
  );
  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.proximity.mdl.bottomSheet.title"
    ),
    component: (
      <VStack>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.body"
          )}
        </Body>
        <QRCode value={qrCodeString} size={QR_WIDTH} ecl="Q" />
        <VSpacer />
      </VStack>
    )
  });

  useEffect(() => {
    if (shouldPresentQRCodeBottomSheet) {
      present();
    }
  }, [shouldPresentQRCodeBottomSheet, present]);

  return {
    bottomSheet,
    dismiss
  };
};
