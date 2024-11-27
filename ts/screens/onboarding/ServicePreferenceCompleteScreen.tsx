import * as React from "react";
import { connect } from "react-redux";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import I18n from "../../i18n";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a service preference change
 * and it has been correctly activated
 */
const ServicePreferenceCompleteScreen = (props: Props): React.ReactElement => (
  <OperationResultScreenContent
    pictogram="success"
    title={I18n.t("services.optIn.preferences.completed.title")}
    subtitle={I18n.t("services.optIn.preferences.completed.body")}
    action={{
      label: I18n.t("global.buttons.continue"),
      onPress: props.onContinue
    }}
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
