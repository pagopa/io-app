import { Container } from "native-base";
import * as React from "react";
import { NavState, StyleSheet, View, WebView } from "react-native";
import { getTransactionIdFrom3dsCheckoutUrl } from "../utils/payment";
import { RefreshIndicator } from "./ui/RefreshIndicator";

type Props = Readonly<{
  url: string;
  onComplete: (transactionId: number) => void;
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

export default class Checkout3DsComponent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isWebViewLoading: true
    };
  }

  private updateLoadingState = (isLoading: boolean) =>
    this.setState({ isWebViewLoading: isLoading });

  private navigationStateChanged = (navState: NavState) => {
    // when the transaction is completed, "loading" is false and the url
    // will end with "/wallet/result?id=XXXX" where XXXX is the transaction ID
    // for the 3ds checkout transaction - once we have the transaction ID
    // we can query the PM for the status of the transaction

    if (navState.url !== undefined) {
      const maybeTransactionId = getTransactionIdFrom3dsCheckoutUrl(
        navState.url
      );
      maybeTransactionId.map(this.props.onComplete);
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
