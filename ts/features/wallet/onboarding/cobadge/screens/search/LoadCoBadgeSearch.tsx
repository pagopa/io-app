import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { searchUserCoBadge, walletAddCoBadgeCancel } from "../../store/actions";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is displayed when searching for co-badge
 * @constructor
 */
const LoadCoBadgeSearch = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      // TODO: replace with localeso
      loadingCaption={"TMP Loading"}
      onAbort={props.cancel}
      onRetry={() => props.retry(props.abiSelected)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(searchUserCoBadge.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingCoBadgeAbiSelectedSelector(state),
  isLoading: !onboardingCoBadgeFoundSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadCoBadgeSearch);
