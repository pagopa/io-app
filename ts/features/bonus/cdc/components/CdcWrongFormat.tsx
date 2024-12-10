import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const CdcWrongFormat = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };
  return (
    <OperationResultScreenContent
      testID="cdcWrongFormat"
      pictogram="umbrellaNew"
      title={I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.ko.wrongFormat.title"
      )}
      subtitle={I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.ko.wrongFormat.body"
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: onExitPress,
        testID: "closeButton"
      }}
    />
  );
};

export default CdcWrongFormat;
