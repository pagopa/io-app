import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ReactElement } from "react";
import { connect } from "react-redux";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../screens/OperationResultScreenContent";

/**
 * This screen is displayed when an unexpected failure occurs in a work unit
 * @constructor
 * @param props
 */
export const WorkunitGenericFailure = (): ReactElement => {
  const navigation = useNavigation();

  useHeaderSecondLevel({ title: "" });

  return (
    <OperationResultScreenContent
      testID={"WorkunitGenericFailure"}
      pictogram="umbrella"
      title={I18n.t("global.jserror.title")}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};

export default connect()(WorkunitGenericFailure);
