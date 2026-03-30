import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const DSScreenOperationResult = () => {
  const navigation = useNavigation();

  return (
    <OperationResultScreenContent
      pictogram="updateOS"
      title="C’è un problema temporaneo, riprova."
      subtitle="Il tuo indirizzo email **example@try.com** è già in uso su IO, devi inserirne uno diverso per continuare a usare l’app."
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.retry"),
        accessibilityLabel: I18n.t("global.buttons.retry"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};

export { DSScreenOperationResult };
