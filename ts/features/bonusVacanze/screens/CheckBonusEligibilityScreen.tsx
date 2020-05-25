import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { GenericLoadingErrorScreen } from "../components/GenericLoadingErrorScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadingCaption = I18n.t(
  "bonus.bonusVacanza.checkBonusEligibility.loading"
);
/**
 * This component link the generic {@link GenericLoadingErrorScreen} with the application flow using the {@link connect}
 * of redux.
 * @param props
 * @constructor
 */
const CheckBonusEligibilityScreen: React.FunctionComponent<Props> = props => {
  return (
    <GenericLoadingErrorScreen
      {...props}
      loadingCaption={loadingCaption}
      loadingOpacity={1}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => {
    RTron.log("CANCEL");
  },
  // TODO: link with the right dispatch action
  onRetry: () => {
    RTron.log("RETRY");
  }
});

const mapStateToProps = (_: GlobalState) => ({
  // TODO: link with the right reducer
  isLoading: true,
  // TODO: link with the right reducer
  errorText: "A text that explains why the operation failed"
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckBonusEligibilityScreen);
