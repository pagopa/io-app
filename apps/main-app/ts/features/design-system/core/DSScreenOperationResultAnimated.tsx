import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const DSScreenOperationResultAnimated = () => {
  const navigation = useNavigation();

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
      pictogram="success"
      secondaryAction={{
        label: I18n.t("global.buttons.retry"),
        onPress: () => navigation.goBack()
      }}
      subtitle="Attendi qualche minuto e riprova."
      title="Non siamo riusciti a recuperare i dati della carta"
    />
  );
};

export { DSScreenOperationResultAnimated };
