import {
  AlertEdgeToEdgeWrapper,
  FooterActions
} from "@pagopa/io-app-design-system";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { useIODispatch } from "../../../../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

const MODAL_BOTTOM_PADDING = 150;

/**
 * HOC that wraps a screen with an Alert which informs the user that the app is offline
 * and allows them to restart the app
 * @param Screen - The screen to wrap
 * @returns The wrapped screen
 */
export const withOfflineAlert =
  (Screen: React.ComponentType<any>) => (props: any) => {
    const dispatch = useIODispatch();

    const handleAppRestart = () => {
      dispatch(startApplicationInitialization());
    };

    const offlineInfoModal = useIOBottomSheetAutoresizableModal(
      {
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
      },
      MODAL_BOTTOM_PADDING
    );

    return (
      <AlertEdgeToEdgeWrapper
        alertProps={{
          content: I18n.t("features.itWallet.offline.alert.title"),
          variant: "info",
          action: I18n.t("features.itWallet.offline.alert.action"),
          onPress: offlineInfoModal.present
        }}
      >
        <Screen {...props} />
        {offlineInfoModal.bottomSheet}
      </AlertEdgeToEdgeWrapper>
    );
  };
