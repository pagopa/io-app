import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Satispay } from "../../../../../../../definitions/pagopa/Satispay";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  addSatispayToWallet,
  walletAddSatispayCancel
} from "../../store/actions";
import {
  onboardingSatispayFoundSelector,
  onboardingSatispayIsErrorSelector
} from "../../store/reducers/foundSatispay";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Loading & Error management when adding a satispay account to the wallet
 * @constructor
 */
const LoadAddSatispayComponent = (props: Props) => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.satispay.loadingAdd.title")}
      onAbort={props.cancel}
      onRetry={() => props.foundSatispay && props.retry(props.foundSatispay)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddSatispayCancel()),
  retry: (s: Satispay) => dispatch(addSatispayToWallet.request(s))
});

const mapStateToProps = (state: GlobalState) => ({
  foundSatispay: onboardingSatispayFoundSelector(state),
  isLoading: !onboardingSatispayIsErrorSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadAddSatispayComponent);
