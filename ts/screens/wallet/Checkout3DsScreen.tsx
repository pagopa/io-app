import * as React from "react";
import { NavState, WebView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "../../store/actions/types";
import { addCreditCardCompleted } from "../../store/actions/wallet/wallets";

type ReduxMappedProps = Readonly<{
  addCreditCardCompleted: () => void;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

class Checkout3DsScreen extends React.Component<Props> {
  private navigationStateChanged = (navState: NavState) => {
    // pagoPA-designated URL for exiting the webview
    // (visisted when the user taps the "close" button)
    const exitUrl = "/wallet/loginMethod";

    if (navState.url !== undefined && navState.url.includes(exitUrl)) {
      // time to leave, trigger the appropriate action
      // to let the saga know that it can wrap things up
      this.props.addCreditCardCompleted();
    }
  };

  public render() {
    const url = this.props.navigation.getParam("url", "https://www.google.com");
    return (
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={this.navigationStateChanged}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  addCreditCardCompleted: () => dispatch(addCreditCardCompleted())
});

export default connect(
  undefined,
  mapDispatchToProps
)(Checkout3DsScreen);
