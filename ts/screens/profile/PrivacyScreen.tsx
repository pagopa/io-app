import { Body, Button, Container, Content, Left, Text } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";

export type State = {
  markdown: string;
};

export const INITIAL_STATE: State = {
  markdown: I18n.t("profile.main.privacy.text")
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

/**
 * A screen to show the Privacy policy to the user.
 */
class PrivacyScreen extends React.Component<Props, State> {
  private goBack() {
    this.props.navigation.goBack();
  }

  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("profile.main.mainPrivacy.screenTitle")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <Markdown>{this.state.markdown}</Markdown>
        </Content>
      </Container>
    );
  }
}

export default PrivacyScreen;
