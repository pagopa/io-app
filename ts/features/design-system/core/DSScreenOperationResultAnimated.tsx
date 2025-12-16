import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const DSScreenOperationResultAnimated = () => {
  const navigation = useNavigation();

  return (
    <OperationResultScreenContent
      pictogram="success"
      title="Non siamo riusciti a recuperare i dati della carta"
      subtitle="Attendi qualche minuto e riprova."
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.retry"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};

export { DSScreenOperationResultAnimated };
