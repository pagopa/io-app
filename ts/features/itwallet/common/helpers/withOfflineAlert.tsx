import {
  AlertEdgeToEdgeWrapper,
  IOButton,
  IOColors,
  useIOToast,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ComponentProps, useCallback, useMemo } from "react";
import { StatusBar } from "react-native";
import { useRoute } from "@react-navigation/native";
import { AlertEdgeToEdge } from "@pagopa/io-app-design-system/lib/typescript/components/alert/AlertEdgeToEdge";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  ItwOfflineRicaricaAppIOSource,
  trackItwOfflineBanner,
  trackItwOfflineBottomSheet,
  trackItwOfflineReloadFailure,
  trackItwOfflineRicaricaAppIO
} from "../../analytics";

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
 * @param handleAppRestart - The function to handle the app restart
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

type OfflineAlertWrapperProps = {
  offlineAccessReason: OfflineAccessReasonEnum;
};

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
 * @param props.offlineAccessReason - The specific reason for the offline state
 * @param props.children - The child components to render below the alert
 * @returns A wrapped view with the offline alert and the original content
 */
const OfflineAlertWrapper = ({
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
 * Hook that creates and manages a function to restart the application.
 *
 * @param source - The source of the app restart action, for analytics purposes
 * @returns A function to restart the application
 */
const useAppRestartAction = (source: ItwOfflineRicaricaAppIOSource) => {
  const toast = useIOToast();
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);

  return useCallback(() => {
    if (isConnected) {
      trackItwOfflineRicaricaAppIO(source);
      // Reset the offline access reason.
      // Since this state is `undefined` when the user is online,
      // the startup saga will proceed without blocking.
      dispatch(resetOfflineAccessReason());
      // Dispatch this action to mount the correct navigator.
      dispatch(startupLoadSuccess(StartupStatusEnum.INITIAL));
      // restart startup saga
      dispatch(startApplicationInitialization());
    } else {
      toast.error(I18n.t("features.itWallet.offline.failure"));
      trackItwOfflineReloadFailure();
    }
  }, [dispatch, isConnected, toast, source]);
};

/**
 * Higher-Order Component that conditionally wraps screens with an offline alert notification.
 *
 * This HOC checks the application's offline state using the `offlineAccessReasonSelector`.
 * When the app is online (no offline reason detected), it renders the original screen unchanged.
 * When offline, it wraps the screen with the `OfflineAlertWrapper` component, which displays:
 * - A persistent alert banner at the top of the screen
 * - A modal with detailed information and app restart options when tapped
 *
 * Uses functional programming patterns (fp-ts) for handling the Optional offline reason value.
 *
 * @example
 * ```tsx
 * // Create an enhanced component with offline alert functionality
 * const ProfileScreenWithOfflineAlert = withOfflineAlert(ProfileScreen);
 *
 * // Use in navigation or component tree
 * <ProfileScreenWithOfflineAlert someProp={value} />
 * ```
 *
 * @param Screen - The React component to enhance with offline alert functionality
 * @returns A new component that conditionally renders the offline alert based on application state
 */
export const withOfflineAlert =
  (Screen: React.ComponentType<any>) => (props: any) =>
    pipe(
      useIOSelector(offlineAccessReasonSelector),
      O.fromNullable,
      O.fold(
        () => <Screen {...props} />,
        reason => (
          <OfflineAlertWrapper offlineAccessReason={reason}>
            <Screen {...props} />
          </OfflineAlertWrapper>
        )
      )
    );
