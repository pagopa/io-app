import {
  AlertEdgeToEdgeWrapper,
  IOButton,
  IOColors,
  VStack
} from "@pagopa/io-app-design-system";
import { AlertEdgeToEdge } from "@pagopa/io-app-design-system/lib/typescript/components/alert/AlertEdgeToEdge";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ComponentProps, PropsWithChildren, useCallback, useMemo } from "react";
import { StatusBar } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import {
  trackItwOfflineBanner,
  trackItwOfflineBottomSheet,
  trackItwOfflineRicaricaAppIO
} from "../../analytics";
import { useAppRestartAction } from "../hooks/useAppRestartAction.ts";

/**
 * A wrapper component that displays an alert to notify users when the
 * application is in offline mode.
 *
 * This component renders a persistent alert at the top of the screen
 * with information about the offline state. When tapped, it opens a modal
 * with more details and options to restart the application when connectivity
 * is restored.
 *
 * The alert content and behavior varies based on the specific offline reason
 * (device offline, expired session, etc.).
 *
 * @param props - Component properties
 * @param props.children - The child components to render below the alert
 * @returns A wrapped view with the offline alert and the original content
 */
export const ItwOfflineAlertWrapper = ({ children }: PropsWithChildren) =>
  pipe(
    useIOSelector(offlineAccessReasonSelector),
    O.fromNullable,
    O.fold(
      () => children,
      reason => (
        <AlertWrapper offlineAccessReason={reason}>{children}</AlertWrapper>
      )
    )
  );

type OfflineAlertWrapperProps = {
  offlineAccessReason: OfflineAccessReasonEnum;
};

/**
 * Wrapper component that displays an alert with details about the offline state
 * and provides options to restart the application.
 *
 * @param props - Component properties
 * @param props.offlineAccessReason - The specific reason for the offline state
 * @param props.children - The child components to render below the alert
 * @returns A wrapped view with the offline alert and the original content
 */
const AlertWrapper = ({
  offlineAccessReason,
  children
}: React.PropsWithChildren<OfflineAlertWrapperProps>) => {
  const { name } = useRoute();

  const isConnected = useIOSelector(isConnectedSelector);
  const handleAppRestart = useAppRestartAction("banner");

  useOnFirstRender(() => {
    trackItwOfflineBanner({
      screen: name,
      error_message_type: offlineAccessReason,
      use_case: "starting_app"
    });
  });

  const detailModal = useOfflineAlertDetailModal(offlineAccessReason);

  const openBottomSheet = useCallback(() => {
    detailModal.present();
    trackItwOfflineBottomSheet();
  }, [detailModal]);

  const alertProps: ComponentProps<typeof AlertEdgeToEdge> = useMemo(() => {
    if (
      offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE &&
      isConnected
    ) {
      return {
        content: I18n.t(`features.itWallet.offline.back_online.alert.content`),
        action: I18n.t(`features.itWallet.offline.back_online.alert.action`),
        variant: "success",
        onPress: handleAppRestart
      };
    }

    return {
      content: I18n.t(
        `features.itWallet.offline.${offlineAccessReason}.alert.content`
      ),
      action: I18n.t(
        `features.itWallet.offline.${offlineAccessReason}.alert.action`
      ),
      variant: "info",
      onPress: openBottomSheet
    };
  }, [offlineAccessReason, isConnected, openBottomSheet, handleAppRestart]);

  return (
    <AlertEdgeToEdgeWrapper alertProps={alertProps}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={IOColors["info-100"]}
      />
      {children}
      {detailModal.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};

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
const useOfflineAlertDetailModal = (
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
