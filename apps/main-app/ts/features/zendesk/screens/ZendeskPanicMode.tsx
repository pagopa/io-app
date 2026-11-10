import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../store/hooks";
import { zendeskSupportCompleted } from "../store/actions";

/**
 * This screen is shown to users when panic mode is enabled in remote Zendesk
 * configuration. It only allows the user to leave the Zendesk workflow.
 *
 * @class
 */
const ZendeskPanicMode = () => {
  const dispatch = useIODispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: workUnitCompleted,
        testID: "closeButton"
      }}
      pictogram={"fatalError"}
      subtitle={I18n.t("support.panicMode.body")}
      testID={"zendeskPanicMode"}
      title={I18n.t("support.panicMode.title")}
    />
  );
};

export default ZendeskPanicMode;
