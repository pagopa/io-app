/**
 * A screen displayed while the backend manage the opening of the session for the CIE authentication
 */
import { Content, H2, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";

type Props = NavigationInjectedProps;

type State = {
  isLoadingCompleted: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  },
  flex: {
    flex: 1
  }
});

class CieAuthorizeDataUsageScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoadingCompleted: false };
    this.handleMarkdownLoadingCompleted =
      this.handleMarkdownLoadingCompleted.bind(this);
  }

  private readonly handleMarkdownLoadingCompleted = () => {
    this.setState({ isLoadingCompleted: true });
  };

  public render(): React.ReactNode {
    const cancelButtonProps = {
      block: true,
      cancel: true,
      onPress: this.props.navigation.goBack,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: () => Alert.alert(I18n.t("global.notImplemented")),
      title: I18n.t("global.buttons.retry")
    };
    return (
      <TopScreenComponent goBack={true}>
        <Content contentContainerStyle={styles.flex} noPadded={true}>
          <View style={styles.contentContainerStyle}>
            <H2>{I18n.t("authentication.cie.noDataTitle")}</H2>
            <View spacer={true} />
            <Markdown onLoadEnd={this.handleMarkdownLoadingCompleted}>
              {I18n.t("authentication.cie.authToSendData")}
            </Markdown>
          </View>
        </Content>
        {this.state.isLoadingCompleted && (
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            rightButton={retryButtonProps}
            leftButton={cancelButtonProps}
          />
        )}
      </TopScreenComponent>
    );
  }
}

export default CieAuthorizeDataUsageScreen;
