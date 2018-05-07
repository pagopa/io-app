import {
  Body,
  Button,
  Container,
  Content,
  H1,
  H3,
  Icon,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { ReduxProps } from "../../actions/types";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import { acceptTos } from "../../store/actions/onboarding";
type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
/**
 * A screen to show the ToS to the user.
 */
class TosScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }
  public acceptTos = () => {
    this.props.dispatch(acceptTos());
  };
  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("onboarding.tos.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>{I18n.t("onboarding.tos.contentTitle")}</H1>
          <View spacer={true} extralarge={true} />
          <H3>{I18n.t("onboarding.tos.section1")}</H3>
          <View spacer={true} />
          <Text>{I18n.t("lipsum.medium")}</Text>
          <View spacer={true} extralarge={true} />
          <H3>{I18n.t("onboarding.tos.section2")}</H3>
          <View spacer={true} />
          <Text>{I18n.t("lipsum.medium")}</Text>
        </Content>
        <View footer={true}>
          <Button block={true} primary={true} onPress={_ => this.acceptTos()}>
            <Text>{I18n.t("onboarding.tos.continue")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
export default connect()(TosScreen);
