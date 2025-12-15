import { Alert } from "react-native";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";

const DSLoadingScreenExtendedProps = () => {
  const navigation = useIONavigation();

  return (
    <LoadingScreenContent
      headerVisible
      title={"Loading…"}
      subtitle={
        "Potreste essere in tanti in questo momento.\nPuoi riprovare tra qualche minuto, o puoi richiedere il bonus dal sito dedicato."
      }
      action={{
        label: "Torna indietro",
        onPress: () => navigation.popToTop()
      }}
      banner={{
        color: "turquoise",
        title: "Banner title",
        pictogramName: "timing",
        action: "Action text",
        onPress: () => {
          Alert.alert("Alert", "Action triggered");
        }
      }}
    />
  );
};

export { DSLoadingScreenExtendedProps };
