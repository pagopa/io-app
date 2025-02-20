import {
  AlertEdgeToEdgeWrapper,
  FooterActions
} from "@pagopa/io-app-design-system";
import { CommonActions } from "@react-navigation/native";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { useIODispatch } from "../../../../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

const MODAL_BOTTOM_PADDING = 150;

export const withOfflineAlert =
  (Screen: React.ComponentType<any>) => (props: any) => {
    const dispatch = useIODispatch();

    const handleAppRestart = () => {
      dispatch(startApplicationInitialization());
      NavigationService.getNavigator().current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.MAIN }]
        })
      );
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
