import { Option } from "fp-ts/lib/Option";
import { Container, H1, Text, Toast, View } from "native-base";
import * as React from "react";
import { Linking, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class CieExpiredOrInvalidScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private browseToLink() {
    const url =
      "https://www.cartaidentita.interno.gov.it/prenotazione-della-richiesta/";
    Linking.openURL(url).catch(() => {
      Toast.show({ text: I18n.t("genericError") });
    });
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <H1>{I18n.t("authentication.landing.expiredCardTitle")}</H1>
            <View spacer={true} />
            <Text style={styles.text}>
              {I18n.t("authentication.landing.expiredCardContent")}
            </Text>
            <View spacer={true} />
            <Text link={true} onPress={() => this.browseToLink()}>
              {I18n.t("authentication.landing.expiredCardHelp")}
            </Text>
          </View>
        </BaseScreenComponent>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            cancel: true,
            onPress: (): boolean => this.props.navigation.goBack(),
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
        />
      </Container>
    );
  }
}

export default CieExpiredOrInvalidScreen;
