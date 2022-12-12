import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  searchUserSatispay,
  walletAddSatispayCancel
} from "../../store/actions";
import { onboardingSatispayIsErrorSelector } from "../../store/reducers/foundSatispay";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The screen that show the loading (or error) to the user
 * @constructor
 */
const LoadSatispaySearch = (props: Props) => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.satispay.loadingSearch.title")}
      onAbort={props.cancel}
      onRetry={props.retry}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddSatispayCancel()),
  retry: () => dispatch(searchUserSatispay.request())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: !onboardingSatispayIsErrorSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadSatispaySearch);
