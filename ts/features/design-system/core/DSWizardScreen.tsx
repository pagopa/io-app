import React from "react";
import { Alert } from "react-native";
import { WizardScreen } from "../../../components/screens/WizardScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSWizardScreen = () => (
  <WizardScreen
    pictogram="cie"
    title="Titolo del wizard"
    description="Descrizione del wizard che può essere più lunga e occupare più righe."
    actions={{
      type: "TwoButtons",
      primary: {
        label: "Avanti",
        onPress: onButtonPress
      },
      secondary: {
        label: "Come funziona?",
        onPress: onButtonPress
      }
    }}
  />
);
