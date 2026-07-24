import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";

export const MessageGreenPassScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("features.greenPass.button"),
        onPress: navigation.goBack,
        testID: "green-pass-button"
      }}
      isHeaderVisible
      pictogram="attention"
      title={I18n.t("features.greenPass.title")}
    />
  );
};
