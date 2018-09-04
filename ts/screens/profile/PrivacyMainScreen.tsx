import { Col, Content, Grid, H1, H3, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import ROUTES from "../../navigation/routes";

import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  gridRow: {
    paddingTop: variables.contentPadding,
    alignItems: "center"
  }
});

/**
 * A component to show the main screen of the Privacy section
 */
export const PrivacyMainScreen: React.SFC<Props> = props => (
  <BaseScreenComponent
    goBack={() => props.navigation.goBack()}
    headerTitle={I18n.t("profile.main.screenTitle")}
  >
    <Content>
      <View>
        <H1>{I18n.t("profile.main.mainPrivacy.screenTitle")}</H1>
        <Text>{I18n.t("profile.main.mainPrivacy.screenSubtitle")}</Text>
        <Grid>
          {/* Privacy Policy*/}
          <Row
            style={styles.gridRow}
            onPress={() => props.navigation.navigate(ROUTES.PROFILE_PRIVACY)}
          >
            <Col size={10}>
              <H3>{I18n.t("profile.main.mainPrivacy.privacyPolicy.title")}</H3>
              <Text>
                {I18n.t("profile.main.mainPrivacy.privacyPolicy.description")}
              </Text>
            </Col>
            <Col size={2}>
              <IconFont
                name="io-right"
                color={variables.contentPrimaryBackground}
              />
            </Col>
          </Row>
          {/* Remove account */}
          <Row
            style={styles.gridRow}
            onPress={() => Alert.alert(I18n.t("global.notImplemented"))}
          >
            <Col size={10}>
              <H3>{I18n.t("profile.main.mainPrivacy.removeAccount.title")}</H3>
              <Text>
                {I18n.t("profile.main.mainPrivacy.removeAccount.description")}
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
          <Row
            style={styles.gridRow}
            onPress={() => Alert.alert(I18n.t("global.notImplemented"))}
          >
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
  </BaseScreenComponent>
);
