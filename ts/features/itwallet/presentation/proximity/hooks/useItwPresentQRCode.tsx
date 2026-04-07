import { Body, IOVisualCostants, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Dimensions, View } from "react-native";

import { MaxBrightness } from "../../../../../utils/brightness";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwRetryableQRCode } from "../../../common/components/ItwRetryableQRCode";
import { trackItwProximityQrCodeLoadingRetry } from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  selectIsLoading,
  selectIsQRCodeGenerationError,
  selectQRCodeString,
  selectShouldPresentQRCodeBottomSheet
} from "../machine/selectors";

const QR_WIDTH =
  Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

export const useItwPresentQRCode = () => {
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isQRCodeGenerationError = ItwProximityMachineContext.useSelector(
    selectIsQRCodeGenerationError
  );
  const machineRef = ItwProximityMachineContext.useActorRef();
  const shouldPresentQRCodeBottomSheet = ItwProximityMachineContext.useSelector(
    selectShouldPresentQRCodeBottomSheet
  );

  const handleRetry = useCallback(() => {
    trackItwProximityQrCodeLoadingRetry();
    machineRef.send({ type: "retry" });
  }, [machineRef]);

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.proximity.mdl.bottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <MaxBrightness useSmoothTransition={true} />
        <Body>
          {I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.body"
          )}
        </Body>
        <ItwRetryableQRCode
          correctionLevel="Q"
          isRetrying={isLoading}
          onRetry={handleRetry}
          retryDescription={I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.error.message"
          )}
          retryIcon="warningFilled"
          retryLabel={I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.error.action"
          )}
          shouldRetry={isQRCodeGenerationError}
          size={QR_WIDTH}
          value={qrCodeString}
        />
        {/* Dummy View used to add space */}
        <View />
      </VStack>
    ),
    onDismiss: () => {
      machineRef.send({ type: "dismiss" });
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (shouldPresentQRCodeBottomSheet) {
        present();
      }

      return dismiss;
    }, [dismiss, present, shouldPresentQRCodeBottomSheet])
  );

  return {
    bottomSheet,
    dismiss
  };
};
