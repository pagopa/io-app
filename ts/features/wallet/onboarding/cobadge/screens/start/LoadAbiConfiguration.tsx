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
  loadCoBadgeAbiConfiguration,
  walletAddCoBadgeCancel
} from "../../store/actions";
import { coBadgeAbiConfigurationSelector } from "../../store/reducers/abiConfiguration";

export type Props = WithTestID<
  ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>
>;

/**
 * This screen is displayed when loading co-badge configuration
 * @constructor
 */
const LoadAbiConfiguration = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.coBadge.start.loading")}
      onAbort={props.cancel}
      onRetry={props.retry}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel()),
  retry: () => dispatch(loadCoBadgeAbiConfiguration.request())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: pot.isLoading(coBadgeAbiConfigurationSelector(state))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadAbiConfiguration);
