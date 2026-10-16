import I18n from "i18next";
import { ReactElement } from "react";
import { connect } from "react-redux";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { servicesOptinCompleted } from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Screen which is displayed when a user requested a service preference change
 * and it has been correctly activated
 */
const ServicePreferenceCompleteScreen = (props: Props): ReactElement => (
  <OperationResultScreenContent
    action={{
      label: I18n.t("global.buttons.continue"),
      onPress: props.onContinue
    }}
    pictogram="success"
    subtitle={I18n.t("services.optIn.preferences.completed.body")}
    title={I18n.t("services.optIn.preferences.completed.title")}
  />
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onContinue: () => {
    dispatch(servicesOptinCompleted());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicePreferenceCompleteScreen);
