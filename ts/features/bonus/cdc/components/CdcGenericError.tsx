import { useNavigation } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const CdcGenericError = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };

  return (
    <OperationResultScreenContent
      testID="cdcGenericError"
      pictogram="umbrellaNew"
      title={I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.ko.genericError.title"
      )}
      subtitle={I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.ko.genericError.body"
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: onExitPress,
        testID: "closeButton"
      }}
    />
  );
};

export default CdcGenericError;
