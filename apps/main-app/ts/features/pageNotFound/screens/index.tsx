import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { openAppStoreUrl } from "../../../utils/url";
import {
  track404ErrorScreen,
  track404ErrorScreenCloseButton,
  track404ErrorScreenUpdateAppButton
} from "../analytics";

export const BTN_UPDATE_TEST_ID = "pageNotFoundBtnUpdateId";
export const BTN_CLOSE_TEST_ID = "pageNotFoundBtnCloseId";

export const PageNotFound = () => {
  const { error } = useIOToast();
  const { popToTop } = useIONavigation();

  useOnFirstRender(() => {
    void track404ErrorScreen();
  });

  return (
    <OperationResultScreenContent
      action={{
        testID: BTN_UPDATE_TEST_ID,
        label: I18n.t("btnUpdateApp"),
        onPress: async () => {
          void track404ErrorScreenUpdateAppButton();
          void openAppStoreUrl(() => {
            error(I18n.t("msgErrorUpdateApp"));
          });
        }
      }}
      pictogram="empty"
      secondaryAction={{
        testID: BTN_CLOSE_TEST_ID,
        label: I18n.t("global.buttons.close"),
        onPress: () => {
          void track404ErrorScreenCloseButton();
          popToTop();
        }
      }}
      subtitle={I18n.t("pageNotFound.subtitle")}
      title={I18n.t("pageNotFound.title")}
    />
  );
};
