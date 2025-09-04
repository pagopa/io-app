import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Body, IOVisualCostants, VStack } from "@pagopa/io-app-design-system";
import { Dimensions, View } from "react-native";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  selectIsLoading,
  selectIsQRCodeGenerationError,
  selectQRCodeString,
  selectShouldPresentQRCodeBottomSheet
} from "../machine/selectors";
import { ItwRetryableQRCode } from "../../../common/components/ItwRetryableQRCode";
import { trackItwProximityQrCodeLoadingRetry } from "../analytics";
import { MaxBrightness } from "../../../../../utils/brightness";

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
          value={qrCodeString}
          size={QR_WIDTH}
          correctionLevel="Q"
          shouldRetry={isQRCodeGenerationError}
          retryIcon="warningFilled"
          retryDescription={I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.error.message"
          )}
          retryLabel={I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.error.action"
          )}
          isRetrying={isLoading}
          onRetry={handleRetry}
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
