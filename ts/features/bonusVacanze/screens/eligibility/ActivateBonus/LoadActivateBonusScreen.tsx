import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { BaseLoadingErrorScreen } from "../../../components/loadingErrorScreen/BaseLoadingErrorScreen";
type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadingCaption = I18n.t(
  "bonus.bonusVacanza.eligibility.activate.loading"
);

/**
 * This screen is used during the activation of the bonus (and the associated loading phase).
 * This component link the generic {@link BaseLoadingErrorScreen} with the application flow using the {@link connect}
 * of redux.
 * @param props
 * @constructor
 */
const LoadActivateBonusScreen: React.FunctionComponent<Props> = props => {
  return (
    <BaseLoadingErrorScreen
      {...props}
      navigationTitle={loadingCaption}
      loadingCaption={loadingCaption}
      loadingOpacity={1}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action, will dispatch the cancel request
  onCancel: () => undefined,
  // TODO: link with the right dispatch action, will dispatch the retry request
  onRetry: () => undefined
});

const mapStateToProps = (_: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  // TODO: link with the real data
  isLoading: true
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadActivateBonusScreen);
