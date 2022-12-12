import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { searchUserPans, walletAddBancomatCancel } from "../../store/actions";
import { onboardingBancomatAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingBancomatPansIsError } from "../../store/reducers/pans";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is displayed when searching for Bancomat
 * @constructor
 */
const LoadBancomatSearch: React.FunctionComponent<Props> = props => {
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
      onRetry={() => props.retry(props.abiSelected)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(searchUserPans.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingBancomatAbiSelectedSelector(state),
  isLoading: !onboardingBancomatPansIsError(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadBancomatSearch);
