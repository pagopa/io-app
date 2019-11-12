import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class NfcActiveScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <ScreenHeader
            heading={<H1>{I18n.t("authentication.cie.nfcEnabledTitle")}</H1>}
            icon={require("../../../img/icons/nfc-icon.png")}
          />
          <View style={styles.contentContainerStyle}>
            <Text style={styles.text}>
              {I18n.t("authentication.cie.nfcEnabledContent")}
            </Text>
          </View>
        </BaseScreenComponent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            cancel: true,
            onPress: this.props.navigation.goBack,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
          rightButton={{
            cancel: false,
            // TODO: proceed with authentication https://www.pivotaltracker.com/story/show/169685147
            onPress: () => Alert.alert(I18n.t("global.notImplemented")),
            title: I18n.t("global.buttons.continue"),
            block: true
          }}
        />
      </Container>
    );
  }
}

export default NfcActiveScreen;
