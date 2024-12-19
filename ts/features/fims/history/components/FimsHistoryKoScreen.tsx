import { useNavigation } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";
import { fimsHistoryGet } from "../store/actions";

export const FimsHistoryKoScreen = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={I18n.t("FIMS.history.errorStates.ko.title")}
      subtitle={I18n.t("FIMS.history.errorStates.ko.body")}
      secondaryAction={{
        label: I18n.t("global.buttons.back"),
        onPress: () => navigation.goBack()
      }}
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: () =>
          dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }))
      }}
    />
  );
};
