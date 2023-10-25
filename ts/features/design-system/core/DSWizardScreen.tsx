import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { WizardScreen } from "../../../components/screens/WizardScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const DSWizardScreen = () => {
  const navigation = useNavigation();

  return (
    <WizardScreen
      pictogram="cie"
      goBack={() => navigation.goBack()}
      title="Titolo del wizard"
      description="Descrizione del wizard che può essere più lunga e occupare più righe."
      primaryButton={{
        label: "Avanti",
        accessibilityLabel: "Avanti",
        onPress: onButtonPress
      }}
      actionButton={{
        label: "Come funziona?",
        accessibilityLabel: "Come funziona?",
        onPress: onButtonPress
      }}
    />
  );
};

export { DSWizardScreen };
