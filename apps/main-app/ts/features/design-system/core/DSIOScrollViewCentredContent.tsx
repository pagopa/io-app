import { Alert } from "react-native";

import { IOScrollViewCentredContent } from "../../../components/ui/IOScrollViewCentredContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSIOScrollViewCentredContent = () => {
  useHeaderSecondLevel({
    canGoBack: true,
    title: ""
  });
  return (
    <IOScrollViewCentredContent
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
      additionalLink={{
        label: "Pulsante facoltativo",
        onPress: onButtonPress
      }}
      description="Descrizione del wizard che può essere più lunga e occupare più righe."
      pictogram="cie"
      title="Titolo del wizard"
    />
  );
};
