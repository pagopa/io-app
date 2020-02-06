import { Button, Container, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = {
  isLoadingCompleted: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  },
  text: {
    fontSize: customVariables.fontSizeBase
  }
});

class TemporarilyBlockedCieScreen extends React.Component<Props, State> {
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
      onPress: (): void => {
        this.props.navigation.goBack();
      },
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: (): void => Alert.alert(I18n.t("global.notImplemented")), // TODO
      title: I18n.t(
        "authentication.cie.card.error.temporarilyBlockedCieDoneButton"
      )
    };

    // replace with a computed value
    const isCieIDAppInstalled = true;

    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <Markdown onLoadEnd={this.handleMarkdownLoadingCompleted}>
              {I18n.t("authentication.cie.card.error.temporarilyBlockedCie")}
            </Markdown>
            <View spacer={true} />
            {this.state.isLoadingCompleted &&
              isCieIDAppInstalled && (
                <Button
                  block={true}
                  primary={true}
                  iconLeft={true}
                  // TODO: add redirect to the store or, if installed, to the CieID app https://www.pivotaltracker.com/story/show/169642034
                  onPress={(): void =>
                    Alert.alert(I18n.t("global.notImplemented"))
                  }
                  testID={"landing-button-login-cie"}
                >
                  <IconFont
                    name={"io-cie"}
                    color={customVariables.colorWhite}
                  />
                  <Text>
                    {I18n.t(
                      "authentication.cie.card.error.temporarilyBlockedCieOpenCieID"
                    )}
                  </Text>
                </Button>
              )}
          </View>
        </BaseScreenComponent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          rightButton={retryButtonProps}
          leftButton={cancelButtonProps}
        />
      </Container>
    );
  }
}
export default TemporarilyBlockedCieScreen;
