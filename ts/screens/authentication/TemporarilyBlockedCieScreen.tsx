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
const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  },
  text: {
    fontSize: customVariables.fontSizeBase
  }
});

class TemporarilyBlockedCieScreen extends React.Component<Props> {
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
      onPress: (): void => Alert.alert(I18n.t("global.notImplemented")),
      title: I18n.t("authentication.cie.temporarilyBlockedCieDoneButton")
    };

    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <Markdown>
              {I18n.t("authentication.cie.temporarilyBlockedCie")}
            </Markdown>
            <View spacer={true} />
            <Button
              block={true}
              primary={true}
              iconLeft={true}
              onPress={(): void => Alert.alert(I18n.t("global.notImplemented"))}
              testID={"landing-button-login-cie"}
            >
              <IconFont name={"io-cie"} color={customVariables.colorWhite} />
              <Text>
                {I18n.t("authentication.cie.temporarilyBlockedCieOpenCieID")}
              </Text>
            </Button>
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
