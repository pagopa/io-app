import {
  AlertEdgeToEdgeWrapper,
  FooterActions,
  IOColors,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback } from "react";
import { StatusBar } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";

const MODAL_BOTTOM_PADDING = 175;

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
  const toast = useIOToast();
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);

  const handleAppRestart = useCallback(() => {
    if (isConnected) {
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
    }
  }, [dispatch, isConnected, toast]);

  return useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        `features.itWallet.offline.${offlineAccessReason}.modal.title`
      ),
      component: (
        <IOMarkdown
          content={I18n.t(
            `features.itWallet.offline.${offlineAccessReason}.modal.content`
          )}
        />
      ),
      footer: (
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t("features.itWallet.offline.action"),
              onPress: handleAppRestart
            }
          }}
        />
      )
    },
    MODAL_BOTTOM_PADDING
  );
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
  const detailModal = useOfflineAlertDetailModal(offlineAccessReason);

  return (
    <AlertEdgeToEdgeWrapper
      alertProps={{
        content: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.content`
        ),
        action: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.action`
        ),
        variant: "info",
        onPress: detailModal.present
      }}
    >
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
