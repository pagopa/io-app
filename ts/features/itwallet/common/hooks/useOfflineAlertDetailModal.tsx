import { useCallback } from "react";
import { VStack, IOButton } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIODispatch } from "../../../../store/hooks";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { trackItwOfflineRicaricaAppIO } from "../../analytics";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useAppRestartAction } from "../../wallet/hooks/useAppRestartAction";

/**
 * Hook that creates and manages a bottom sheet modal to display detailed information
 * about the current offline state and provide app restart functionality.
 *
 * The modal includes:
 * - A title based on the specific offline reason
 * - Detailed explanation content rendered via IOMarkdown
 * - A button to attempt app restart when connectivity is restored
 *
 * When the restart button is pressed:
 * - If the device is connected, it will reset the offline state and restart the application
 * - If the device is still offline, it shows an error toast
 *
 * @param offlineAccessReason - The specific reason for the offline state, used to
 *                             determine the content and behavior of the modal
 * @returns An object with the bottom sheet modal controller (present, dismiss) and the modal component
 */
export const useOfflineAlertDetailModal = (
  offlineAccessReason: OfflineAccessReasonEnum
) => {
  const dispatch = useIODispatch();
  const handleAppRestart = useAppRestartAction("bottom_sheet");

  const navigateOnAuthPage = useCallback(() => {
    trackItwOfflineRicaricaAppIO("bottom_sheet");
    // Reset the offline access reason.
    // Since this state is `undefined` when the user is online,
    // the startup saga will proceed without blocking.
    dispatch(resetOfflineAccessReason());
    // Dispatch this action to mount the correct navigator.
    dispatch(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED));
  }, [dispatch]);

  const handlePressModalAction = useCallback(() => {
    if (offlineAccessReason === OfflineAccessReasonEnum.SESSION_EXPIRED) {
      navigateOnAuthPage();
    } else {
      handleAppRestart();
    }
  }, [handleAppRestart, navigateOnAuthPage, offlineAccessReason]);

  return useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.offline.${offlineAccessReason}.modal.title`
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            `features.itWallet.offline.${offlineAccessReason}.modal.content`
          )}
        />
        <IOButton
          variant="solid"
          label={I18n.t(
            `features.itWallet.offline.${offlineAccessReason}.modal.footerAction`
          )}
          onPress={handlePressModalAction}
        />
      </VStack>
    )
  });
};
