import { Option } from "fp-ts/lib/Option";
import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

type State = Readonly<{
  securityCode: Option<string>;
  holder: Option<string>;
}>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class CieExpiredOrInvalidScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <NavigationEvents onWillFocus={undefined} />
          <View style={styles.contentContainerStyle}>
            <H1>{I18n.t("authentication.landing.expiredCardTitle")}</H1>
            <View spacer={true} />
            <Text style={styles.text}>
              {I18n.t("authentication.landing.expiredCardContent")}
            </Text>
            <View spacer={true} />
            <Text link={true} onPress={undefined}>
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

export default connect()(CieExpiredOrInvalidScreen);
