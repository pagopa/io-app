import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { abortBonusRequest } from "../../components/alert/AbortBonusRequest";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../components/loadingErrorScreen/LoadingErrorComponent";
import {
  bonusVacanzeActivation,
  cancelBonusRequest
} from "../../store/actions/bonusVacanze";
import { activationIsLoading } from "../../store/reducers/activation";
type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is used during the activation of the bonus (and the associated loading phase).
 * This component link the generic {@link BaseLoadingErrorScreen} with the application flow using the {@link connect}
 * of redux.
 * @param props
 * @constructor
 */
const LoadActivateBonusScreen: React.FunctionComponent<Props> = props => {
  const loadingCaption = I18n.t("bonus.bonusVacanza.activation.loading");

  useHardwareBackButton(() => {
    if (!props.isLoading) {
      abortBonusRequest(props.onAbort);
    }
    return true;
  });

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={loadingCaption}
      loadingOpacity={1}
      onAbort={() => abortBonusRequest(props.onAbort)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action, will dispatch the cancel request
  onAbort: () => dispatch(cancelBonusRequest()),
  // TODO: link with the right dispatch action, will dispatch the retry request
  onRetry: () => dispatch(bonusVacanzeActivation.request())
});

const mapStateToProps = (state: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  // TODO: link with the real data
  isLoading: activationIsLoading(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadActivateBonusScreen);
