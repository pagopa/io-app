import React, { useEffect } from "react";
import { connect } from "react-redux";
import { navigationHistoryPop } from "../../../store/actions/navigationHistory";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import {
  checkBonusVacanzeEligibility,
  eligibilityAsyncReady
} from "../store/actions/bonusVacanze";
import { eligibilitySelector } from "../store/reducers/eligibility";
import LoadBonusEligibilityScreen from "./eligibility/LoadBonusEligibilityScreen";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

// this is a dummy screen reachable only from a message CTA
// when the component is mounted the checkBonusEligibility action will be dispatched
const BonusCTAEligibilityStartScreen = (props: Props) => {
  useEffect(
    () => {
      // coming from message CTA
      // if we are here it means the eligibility check result is available
      if (!props.isCheckAsyncReady) {
        props.dispatchEligibilityAsyncCheckReady();
      } else if (props.isCheckAsyncReady === true) {
        props.startEligibilityCheck();
      }
    },
    [props.isCheckAsyncReady]
  );

  return <LoadBonusEligibilityScreen />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startEligibilityCheck: () => {
    dispatch(checkBonusVacanzeEligibility.request());
    dispatch(navigationHistoryPop(1));
  },
  dispatchEligibilityAsyncCheckReady: () =>
    dispatch(eligibilityAsyncReady(true))
});

const mapStateToProps = (state: GlobalState) => {
  return {
    isCheckAsyncReady: eligibilitySelector(state).isCheckAsyncReady
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BonusCTAEligibilityStartScreen);
