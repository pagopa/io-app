import * as React from "react";
import { Alert, Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import URLParse from "url-parse";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import { showToast } from "../../utils/showToast";

type OwnProps = Readonly<{
  url: string;
  onCheckout3dsSuccess: (redirectionUrls: ReadonlyArray<string>) => void;
}>;

type Props = OwnProps & NavigationInjectedProps;

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

class Checkout3DsModal extends React.Component<Props, State> {
  private navigationUrls: Array<string>;
  constructor(props: Props) {
    super(props);
    this.state = {
      isWebViewLoading: true
    };
    this.navigationUrls = [];
  }

  private updateLoadingState = (isLoading: boolean) =>
    this.setState({ isWebViewLoading: isLoading });

  private navigationStateChanged = (navState: WebViewNavigation) => {
    // pagoPA-designated URL for exiting the webview
    // (visisted when the user taps the "close" button)
    const exitUrl = "/wallet/loginMethod";

    if (navState.url !== undefined) {
      // collect all urls redirection for troubleshooting purposes
      const url = new URLParse(navState.url);
      // eslint-disable-next-line functional/immutable-data
      this.navigationUrls.push(url.origin);
      if (navState.url.includes(exitUrl)) {
        // time to leave, trigger the appropriate action
        // to let the saga know that it can wrap things up
        this.props.onCheckout3dsSuccess(this.navigationUrls);
      }
    }
  };

  private contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "wallet.saveCard.contextualHelpTitle",
    body: "wallet.saveCard.contextualHelpContent"
  };

  private goBack = () => {
    Alert.alert(I18n.t("wallet.newPaymentMethod.abort.title"), "", [
      {
        text: I18n.t("wallet.newPaymentMethod.abort.confirm"),
        onPress: () => {
          this.props.navigation.goBack();
          showToast(I18n.t("wallet.newPaymentMethod.abort.success"), "success");
        },
        style: "cancel"
      },
      {
        text: I18n.t("wallet.newPaymentMethod.abort.cancel")
      }
    ]);
  };

  public render() {
    const { url } = this.props;
    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={true}
        onRequestClose={this.goBack}
      >
        <BaseScreenComponent
          goBack={this.goBack}
          contextualHelpMarkdown={this.contextualHelpMarkdown}
          headerTitle={I18n.t("wallet.saveCard.header")}
          faqCategories={["wallet_methods"]}
        >
          <WebView
            textZoom={100}
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
        </BaseScreenComponent>
      </Modal>
    );
  }
}

export default withNavigation(Checkout3DsModal);
