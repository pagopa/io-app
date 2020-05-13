import { ActionSheet } from "native-base";
import * as React from "react";
import { Modal, NavState, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import { RTron } from "../../boot/configureStoreAndPersistor";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import { showToast } from "../../utils/showToast";

type OwnProps = Readonly<{
  url: string;
  onCheckout3dsSuccess: () => void;
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

  private contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "wallet.saveCard.contextualHelpTitle",
    body: "wallet.saveCard.contextualHelpContent"
  };

  private goBack = () => {
    ActionSheet.show(
      {
        options: [
          I18n.t("wallet.newPaymentMethod.abort.confirm"),
          I18n.t("wallet.newPaymentMethod.abort.cancel")
        ],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1,
        title: I18n.t("wallet.newPaymentMethod.abort.title")
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // on cancel:
          this.props.navigation.goBack();
          showToast(I18n.t("wallet.newPaymentMethod.abort.success"), "success");
        }
      }
    );
    RTron.log("Back");
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
