import { Container } from "native-base";
import * as React from "react";
import { NavState, StyleSheet, View, WebView } from "react-native";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";

type Props = Readonly<{
  url: string;
  onCheckout3dsSuccess: () => void;
}>;

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

export default class Checkout3DsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isWebViewLoading: true
    };
  }

  private updateLoadingState = (isLoading: boolean) =>
    this.setState({ isWebViewLoading: isLoading });

  private navigationStateChanged = (navState: NavState) => {
    // pagoPA-designated URL for exiting the webview
    // (visisted when the user taps the "close" button)
    const exitUrl = "/wallet/loginMethod";

    if (navState.url !== undefined && navState.url.includes(exitUrl)) {
      // time to leave, trigger the appropriate action
      // to let the saga know that it can wrap things up
      this.props.onCheckout3dsSuccess();
    }
  };

  public render() {
    const { url } = this.props;
    return (
      <Container>
        <WebView
          source={{ uri: url }}
          onNavigationStateChange={this.navigationStateChanged}
          javaScriptEnabled={true}
          onLoadStart={() => this.updateLoadingState(true)}
          onLoadEnd={() => this.updateLoadingState(false)}
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
