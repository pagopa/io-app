import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Body, VStack } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  selectIsLoading,
  selectIsQRCodeGenerationError,
  selectQRCodeString,
  selectShouldPresentQRCodeBottomSheet
} from "../machine/selectors";
import I18n from "../../../../../i18n";
import { ItwEngagementQRCode } from "../components/ItwEngagementQRCode";

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
    machineRef.send({ type: "retry" });
  }, [machineRef]);

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.proximity.mdl.bottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.proximity.mdl.bottomSheet.body"
          )}
        </Body>
        <ItwEngagementQRCode
          qrCodeString={qrCodeString}
          isQRCodeGenerationError={isQRCodeGenerationError}
          isLoading={isLoading}
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
    }, [shouldPresentQRCodeBottomSheet, present])
  );

  return {
    bottomSheet,
    dismiss
  };
};
