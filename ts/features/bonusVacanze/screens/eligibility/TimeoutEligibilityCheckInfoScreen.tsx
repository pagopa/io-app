import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { BaseTimeoutScreen } from "../../components/BaseTimeoutScreen";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { cancelBonusEligibility } from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen informs that checking eligibility is taking too long and
 * will be notified when the operation is completed.
 * @constructor
 */

const TimeoutEligibilityCheckInfoScreen: React.FunctionComponent<
  Props
> = props => {
  const title = I18n.t("bonus.bonusVacanza.eligibility.timeout.title");
  const body = I18n.t("bonus.bonusVacanza.eligibility.timeout.description");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <BaseTimeoutScreen title={title} body={body} onExit={props.onCancel} />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelBonusEligibility())
});

export default connect(
  null,
  mapDispatchToProps
)(TimeoutEligibilityCheckInfoScreen);
