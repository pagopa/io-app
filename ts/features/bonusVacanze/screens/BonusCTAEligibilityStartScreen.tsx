import React, { useEffect } from "react";
import { connect } from "react-redux";
import { navigationHistoryPop } from "../../../store/actions/navigationHistory";
import { Dispatch } from "../../../store/actions/types";
import { checkBonusVacanzeEligibility } from "../store/actions/bonusVacanze";
import LoadBonusEligibilityScreen from "./eligibility/LoadBonusEligibilityScreen";

export type Props = ReturnType<typeof mapDispatchToProps>;

// this is a dummy screen reachable only from a message CTA
// when the component is mounted the checkBonusEligibility action will be dispatched
const BonusCTAEligibilityStartScreen = (props: Props) => {
  useEffect(() => props.startEligibilityCheck(), []);

  return <LoadBonusEligibilityScreen />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startEligibilityCheck: () => {
    dispatch(checkBonusVacanzeEligibility.request());
    dispatch(navigationHistoryPop(1));
  }
});

export default connect(
  undefined,
  mapDispatchToProps
)(BonusCTAEligibilityStartScreen);
