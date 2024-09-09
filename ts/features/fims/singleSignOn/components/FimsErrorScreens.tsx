import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";

export const FimsMissingDataErrorScreen = () => {
  const navigation = useNavigation();

  // this forces headerSecondLevel removal on page entry,
  // since it is not intended by design
  React.useEffect(() => {
    navigation.setOptions({
      header: constNull
    });
  });

  return (
    <OperationResultScreenContent
      title={I18n.t("FIMS.consentsScreen.errorStates.tempErrorBody")}
      pictogram="umbrellaNew"
      isHeaderVisible={true}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack
      }}
    />
  );
};
