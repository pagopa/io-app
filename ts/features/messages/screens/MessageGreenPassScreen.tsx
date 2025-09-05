import I18n from "i18next";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

export const MessageGreenPassScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <OperationResultScreenContent
      title={I18n.t("features.greenPass.title")}
      isHeaderVisible
      pictogram="attention"
      action={{
        label: I18n.t("features.greenPass.button"),
        onPress: navigation.goBack,
        testID: "green-pass-button"
      }}
    />
  );
};
