import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { BaseTimeoutScreen } from "../../components/BaseTimeoutScreen";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { cancelBonusRequest } from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen informs that the bonus activation is taking too long and
 * will be notified when the operation is completed.
 * @constructor
 */

const TimeoutActivationInfoScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanza.activation.timeout.title");
  const body = I18n.t("bonus.bonusVacanza.activation.timeout.description");

  useHardwareBackButton(() => {
    props.onExit();
    return true;
  });

  return <BaseTimeoutScreen title={title} body={body} onExit={props.onExit} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onExit: () => dispatch(cancelBonusRequest())
});

export default connect(
  undefined,
  mapDispatchToProps
)(TimeoutActivationInfoScreen);
