import {
  Body,
  Button,
  Container,
  Content,
  H3,
  H1,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

export type Props = OwnProps & ReduxProps;

const styles = StyleSheet.create({
  gridRow: {
    paddingTop: variables.contentPadding,
    paddingBottom: variables.contentPadding,
    alignItems: "center"
  }
});

/**
 * A component to show the main screen of the Privacy section
 */
export class PrivacyMainScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
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
            <Text>{I18n.t("profile.main.screenTitle")}</Text>
          </Body>
        </AppHeader>

        <Content>
          <View>
            <Text><H1>{I18n.t("profile.main.mainPrivacy.screenTitle")}</H1></Text>

            <Text>{I18n.t("profile.main.mainPrivacy.screenSubtitle")}</Text>
            <Grid>
              {/* Privacy Policy*/}
              <Row style={styles.gridRow}>
                <Col size={10}>
                  <H3>
                    {I18n.t("profile.main.mainPrivacy.privacyPolicy.title")}
                  </H3>
                  <Text>
                    {I18n.t(
                      "profile.main.mainPrivacy.privacyPolicy.description"
                    )}
                  </Text>
                </Col>
                <Col size={2}>
                  <IconFont
                    name="io-right"
                    color={variables.contentPrimaryBackground}
                    onPress={() =>
                      this.props.navigation.navigate(ROUTES.PROFILE_PRIVACY)
                    }
                  />
                </Col>
              </Row>
              {/* Remove account */}
              <Row style={styles.gridRow}>
                <Col size={10}>
                  <H3>
                    {I18n.t("profile.main.mainPrivacy.removeAccount.title")}
                  </H3>
                  <Text>
                    {I18n.t(
                      "profile.main.mainPrivacy.removeAccount.description"
                    )}
                  </Text>
                </Col>
                <Col size={2}>
                  <IconFont
                    name="io-right"
                    color={variables.contentPrimaryBackground}
                  />
                </Col>
              </Row>
              {/* Export your data */}
              <Row style={styles.gridRow}>
                <Col size={10}>
                  <H3>{I18n.t("profile.main.mainPrivacy.exportData.title")}</H3>
                  <Text>
                    {I18n.t("profile.main.mainPrivacy.exportData.description")}
                  </Text>
                </Col>
                <Col size={2}>
                  <IconFont
                    name="io-right"
                    color={variables.contentPrimaryBackground}
                  />
                </Col>
              </Row>
            </Grid>
          </View>
        </Content>
      </Container>
    );
  }
}

export default PrivacyMainScreen;
