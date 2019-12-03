import { Content, H2, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

type State = {
  isLoadingCompleted: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class CieAuthorizeDataUsageScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoadingCompleted: false };
    this.handleMarkdownLoadingCompleted = this.handleMarkdownLoadingCompleted.bind(
      this
    );
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
      onPress: (): void => Alert.alert(I18n.t("global.notImplemented")),
      title: I18n.t("global.buttons.retry")
    };
    return (
      <BaseScreenComponent goBack={true}>
        <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
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
      </BaseScreenComponent>
    );
  }
}

export default CieAuthorizeDataUsageScreen;
