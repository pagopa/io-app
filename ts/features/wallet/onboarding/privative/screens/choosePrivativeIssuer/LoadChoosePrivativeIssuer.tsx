import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { WithTestID } from "../../../../../../types/WithTestID";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  loadPrivativeIssuers,
  walletAddPrivativeCancel
} from "../../store/actions";
import { privativeIssuersSelector } from "../../store/reducers/privativeIssuers";

export type Props = WithTestID<
  ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>
>;

/**
 * This screen is displayed when loading privative configuration
 * @constructor
 */
const LoadChoosePrivativeIssuer = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t(
        "wallet.onboarding.privative.choosePrivativeIssuer.loading"
      )}
      onAbort={props.cancel}
      onRetry={props.retry}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  retry: () => dispatch(loadPrivativeIssuers.request())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: pot.isLoading(privativeIssuersSelector(state))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadChoosePrivativeIssuer);
