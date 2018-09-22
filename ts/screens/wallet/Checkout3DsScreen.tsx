import { Container } from "native-base";
import * as React from "react";
import { NavState, StyleSheet, View, WebView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import { Dispatch } from "../../store/actions/types";
import { addCreditCardCompleted } from "../../store/actions/wallet/wallets";

type ReduxMappedProps = Readonly<{
  addCreditCardCompleted: () => void;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

type State = {
  isWebViewLoading: boolean;
};

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

class Checkout3DsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isWebViewLoading: true
    };
  }

  private enableLoading = () => this.setState({ isWebViewLoading: true });

  private disableLoading = () => this.setState({ isWebViewLoading: false });

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
      <Container>
        <WebView
          source={{ uri: url }}
          onNavigationStateChange={this.navigationStateChanged}
          javaScriptEnabled={true}
          onLoadStart={this.enableLoading}
          onLoadEnd={this.disableLoading}
        />
        {this.state.isWebViewLoading && (
          <View style={styles.refreshIndicatorContainer}>
            <RefreshIndicator />
          </View>
        )}
      </Container>
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
