import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { openAppStoreUrl } from "../../../utils/url";

export const PageNotFound = () => {
  const { error } = useIOToast();
  const { popToTop } = useIONavigation();

  return (
    <OperationResultScreenContent
      pictogram="empty"
      title={I18n.t("pageNotFound.title")}
      subtitle={I18n.t("pageNotFound.subtitle")}
      action={{
        label: I18n.t("btnUpdateApp"),
        onPress: async () => {
          void openAppStoreUrl(() => {
            error(I18n.t("msgErrorUpdateApp"));
          });
        }
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: popToTop
      }}
    />
  );
};
