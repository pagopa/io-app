import {
  AlertEdgeToEdgeWrapper,
  FooterActions,
  IOColors
} from "@pagopa/io-app-design-system";
import { StatusBar } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { startApplicationInitialization } from "../../../../store/actions/ap
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";

/**
 * HOC that wraps a screen with an Alert which informs the user that the app is offline
 * and allows them to restart the app
 * @param Screen - The screen to wrap
 * @returns The wrapped screen
 */
export const withOfflineAlert =
  (Screen: React.ComponentType<any>) => (props: any) => {
    const dispatch = useIODispatch();
    const isConnected = useIOSelector(isConnectedSelector);

    const handleAppRestart = () => {
      if (isConnected) {
        // Reset the offline access reason.
        // Since this state is `undefined` when the user is online,
        // the startup saga will proceed without blocking.
        dispatch(resetOfflineAccessReason());
        // Dispatch this action to mount the correct navigator.
        dispatch(startupLoadSuccess(StartupStatusEnum.INITIAL));
        // restart startup saga
        dispatch(startApplicationInitialization());
      }
    };

    const offlineInfoModal = useIOBottomSheetModal({
      title: I18n.t("features.itWallet.offline.modal.title"),
      component: (
        <IOMarkdown
          content={I18n.t("features.itWallet.offline.modal.content")}
        />
      ),
      footer: (
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t("features.itWallet.offline.modal.action"),
              onPress: handleAppRestart
            }
          }}
        />
      )
    });

    return (
      <AlertEdgeToEdgeWrapper
        alertProps={{
          content: I18n.t("features.itWallet.offline.alert.title"),
          variant: "info",
          action: I18n.t("features.itWallet.offline.alert.action"),
          onPress: offlineInfoModal.present
        }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={IOColors["info-100"]}
        />
        <Screen {...props} />
        {offlineInfoModal.bottomSheet}
      </AlertEdgeToEdgeWrapper>
    );
  };
