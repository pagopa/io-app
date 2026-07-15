import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { fimsHistoryGet } from "../store/actions";

export const FimsHistoryKoScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.retry"),
        testID: "test-retry",
        onPress: () =>
          dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }))
      }}
      pictogram="umbrella"
      secondaryAction={{
        testID: "test-back",
        label: I18n.t("global.buttons.back"),
        onPress: navigation.goBack
      }}
      subtitle={I18n.t("FIMS.history.errorStates.ko.body")}
      title={I18n.t("FIMS.history.errorStates.ko.title")}
    />
  );
};
