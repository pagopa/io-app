import I18n from "i18next";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../store/hooks";
import { zendeskSupportCompleted } from "../store/actions";

/**
 * This screen is shown to users when panic mode is enabled in remote Zendesk configuration.
 * It only allows the user to leave the Zendesk workflow.
 * @constructor
 */
const ZendeskPanicMode = () => {
  const dispatch = useIODispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());

  return (
    <OperationResultScreenContent
      testID={"zendeskPanicMode"}
      pictogram={"fatalError"}
      title={I18n.t("support.panicMode.title")}
      subtitle={I18n.t("support.panicMode.body")}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: workUnitCompleted,
        testID: "closeButton"
      }}
    />
  );
};

export default ZendeskPanicMode;
