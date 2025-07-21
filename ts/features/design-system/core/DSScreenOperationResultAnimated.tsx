import { useNavigation } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";

const DSScreenOperationResultAnimated = () => {
  const navigation = useNavigation();

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="umbrella"
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
