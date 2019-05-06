/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { Content, H3 } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";

type OwnProps = {
  onCancel: () => void;
  onRetry?: () => void;
};
type Props = NavigationInjectedProps &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

class ErrorTransactionScreen extends React.Component<Props> {
  public render() {
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
      >
        <Content noPadded={true}>
          <H3>Testo di prova errore</H3>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

export default connect(mapDispatchToProps)(ErrorTransactionScreen);
