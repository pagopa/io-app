import I18n from "i18n-js";
import * as React from "react";
import WebView from "react-native-webview";
import { mockedItem } from "../../screens/wallet/donation/DonationsHomeScreen";
import LoadingSpinnerOverlay from "../LoadingSpinnerOverlay";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import GenericErrorComponent from "../screens/GenericErrorComponent";
import FooterWithButtons from "../ui/FooterWithButtons";
import IconFont from "../ui/IconFont";

type Props = Readonly<{
  item: mockedItem;
  onClose: () => void;
}>;

type State = Readonly<{
  isContentError: boolean;
  webViewKey: number;
  isContentLoading: boolean;
}>;

export default class DonationVideoWebView extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isContentError: false,
      webViewKey: 0,
      isContentLoading: false
    };
  }

  public render() {
    return (
      <LoadingSpinnerOverlay
        isLoading={this.state.isContentLoading}
        onCancel={this.props.onClose}
      >
        <BaseScreenComponent
          headerTitle={this.props.item.service_name}
          customGoBack={
            <IconFont name={"io-back"} onPress={this.props.onClose} />
          }
        >
          {this.state.isContentError ? (
            <GenericErrorComponent
              onBack={this.props.onClose}
              onRetry={() => {
                const key = this.state.webViewKey;
                this.setState({
                  webViewKey: key + 1,
                  isContentError: false
                });
              }}
            />
          ) : (
            <React.Fragment>
              <WebView
                source={{ uri: this.props.item.video_source }}
                onError={() => this.setState({ isContentError: true })}
                onLoadProgress={() => {
                  this.setState({ isContentLoading: true });
                }}
                onLoadStart={() => this.setState({ isContentLoading: true })}
                onLoadEnd={() => this.setState({ isContentLoading: false })}
              />

              <FooterWithButtons
                type={"SingleButton"}
                leftButton={{
                  title: I18n.t("global.buttons.back"),
                  onPress: this.props.onClose,
                  light: true,
                  bordered: true
                }}
              />
            </React.Fragment>
          )}
        </BaseScreenComponent>
      </LoadingSpinnerOverlay>
    );
  }
}
