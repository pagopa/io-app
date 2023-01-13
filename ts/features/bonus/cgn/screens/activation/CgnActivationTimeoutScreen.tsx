import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { BaseTimeoutScreen } from "../../../common/BaseTimeoutScreen";
import { cgnActivationCancel } from "../../store/actions/activation";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * and it took too long to get an answer from the server
 * (the user will be notified when the activation is completed by a message)
 */
const CgnActivationTimeoutScreen = (props: Props): React.ReactElement => (
  <BaseTimeoutScreen
    title={I18n.t("bonus.cgn.activation.timeout.title")}
    body={I18n.t("bonus.cgn.activation.timeout.body")}
    onExit={props.onExit}
  />
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onExit: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationTimeoutScreen);
