import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { WithTestID } from "../../../../../../types/WithTestID";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { searchUserCoBadge, walletAddCoBadgeCancel } from "../../store/actions";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingCoBadgeFoundIsError } from "../../store/reducers/foundCoBadge";

export type Props = WithTestID<
  ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>
>;

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
      loadingCaption={I18n.t("wallet.onboarding.coBadge.search.loading")}
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
  isLoading: !onboardingCoBadgeFoundIsError(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadCoBadgeSearch);
