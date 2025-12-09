import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../store/hooks";
import { fimsHistoryGet } from "../store/actions";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const FimsHistoryKoScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="umbrella"
      title={I18n.t("FIMS.history.errorStates.ko.title")}
      subtitle={I18n.t("FIMS.history.errorStates.ko.body")}
      secondaryAction={{
        testID: "test-back",
        label: I18n.t("global.buttons.back"),
        onPress: navigation.goBack
      }}
      action={{
        label: I18n.t("global.buttons.retry"),
        testID: "test-retry",
        onPress: () =>
          dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }))
      }}
    />
  );
};
