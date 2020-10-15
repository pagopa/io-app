import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import {
  walletAddBancomatCancel,
  walletAddSelectedBancomat
} from "../../store/actions";
import { onboardingBancomatChosenPanSelector } from "../../store/reducers/addingPans";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & { isLoading: boolean };

/**
 * This screen is displayed when adding a new Bancomat
 * @constructor
 */
const LoadAddBancomatComponent: React.FunctionComponent<Props> = props => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.bancomat.loadingSearch.title")}
      onAbort={props.cancel}
      onRetry={() => props.panSelected && props.retry(props.panSelected)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  retry: (panSelected: PatchedCard) =>
    dispatch(walletAddSelectedBancomat.request(panSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  panSelected: onboardingBancomatChosenPanSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadAddBancomatComponent);
