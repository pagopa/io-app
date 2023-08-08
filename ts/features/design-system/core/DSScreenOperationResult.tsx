import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";

const DSScreenOperationResult = () => {
  const navigation = useNavigation();

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title="C’è un problema temporaneo, riprova."
      subtitle="Premi a lungo uno o più messaggi per archiviarli."
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
