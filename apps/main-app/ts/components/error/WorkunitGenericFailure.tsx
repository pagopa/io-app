import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ReactElement } from "react";
import { connect } from "react-redux";

import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../screens/OperationResultScreenContent";

/**
 * This screen is displayed when an unexpected failure occurs in a work unit
 *
 * @class
 * @param props
 */
export const WorkunitGenericFailure = (): ReactElement => {
  const navigation = useNavigation();

  useHeaderSecondLevel({ title: "" });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
      pictogram="umbrella"
      testID={"WorkunitGenericFailure"}
      title={I18n.t("global.jserror.title")}
    />
  );
};

export default connect()(WorkunitGenericFailure);
