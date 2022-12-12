import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { searchUserBPay, walletAddBPayCancel } from "../../store/actions";
import { onboardingBPayAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingBpayFoundAccountsIsError } from "../../store/reducers/foundBpay";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is displayed when searching for BPay accounts
 * @constructor
 */
const LoadBPaySearch = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.bPay.loadingSearch")}
      onAbort={props.cancel}
      onRetry={() => props.retry(props.abiSelected)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBPayCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(searchUserBPay.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingBPayAbiSelectedSelector(state),
  isLoading: !onboardingBpayFoundAccountsIsError(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadBPaySearch);
