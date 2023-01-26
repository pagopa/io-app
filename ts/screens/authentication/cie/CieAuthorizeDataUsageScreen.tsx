/**
 * A screen displayed while the backend manage the opening of the session for the CIE authentication
 */
import { Content } from "native-base";
import * as React from "react";
import { View, Alert, StyleSheet } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H1 } from "../../../components/core/typography/H1";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import variables from "../../../theme/variables";

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_AUTHORIZE_USAGE_SCREEN"
>;

type State = {
  isLoadingCompleted: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
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
            <H1>{I18n.t("authentication.cie.noDataTitle")}</H1>
            <VSpacer size={16} />
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
