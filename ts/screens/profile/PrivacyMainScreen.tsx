import { Body, H1, H3, List, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import ROUTES from "../../navigation/routes";

import ScreenContent from "../../components/screens/ScreenContent";
import variables from "../../theme/variables";

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

const styles = StyleSheet.create({
  notGrow: {
    flex: 0,
    marginLeft: variables.fontSizeBase
  }
});

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

/**
 * A component to show the main screen of the Privacy section
 */
export const PrivacyMainScreen: React.SFC<Props> = props => (
  <BaseScreenComponent
    goBack={() => props.navigation.goBack()}
    headerTitle={I18n.t("profile.main.screenTitle")}
  >
    <ScreenContent noPadded={true}>
      <View content={true}>
        <H1>{I18n.t("profile.main.mainPrivacy.screenTitle")}</H1>
        <Text>{I18n.t("profile.main.mainPrivacy.screenSubtitle")}</Text>
        <View spacer={true} />

        <List>
          <ListItem
            onPress={() => props.navigation.navigate(ROUTES.PROFILE_PRIVACY)}
          >
            {/* Privacy Policy*/}
            <Body>
              <View>
                <H3>
                  {I18n.t("profile.main.mainPrivacy.privacyPolicy.title")}
                </H3>
                <Text>
                  {I18n.t("profile.main.mainPrivacy.privacyPolicy.description")}
                </Text>
              </View>
            </Body>
            <Right style={styles.notGrow}>
              <IconFont
                name="io-right"
                color={variables.contentPrimaryBackground}
              />
            </Right>
          </ListItem>

          <ListItem onPress={unavailableAlert}>
            {/* Remove account */}
            <Body>
              <View>
                <H3>
                  {I18n.t("profile.main.mainPrivacy.removeAccount.title")}
                </H3>
                <Text>
                  {I18n.t("profile.main.mainPrivacy.removeAccount.description")}
                </Text>
              </View>
            </Body>
            <Right style={styles.notGrow}>
              <IconFont
                name="io-right"
                color={variables.contentPrimaryBackground}
              />
            </Right>
          </ListItem>

          <ListItem onPress={unavailableAlert}>
            {/* Export your data */}
            <Body>
              <View>
                <H3>{I18n.t("profile.main.mainPrivacy.exportData.title")}</H3>
                <Text>
                  {I18n.t("profile.main.mainPrivacy.exportData.description")}
                </Text>
              </View>
            </Body>
            <Right style={styles.notGrow}>
              <IconFont
                name="io-right"
                color={variables.contentPrimaryBackground}
              />
            </Right>
          </ListItem>
        </List>
      </View>
    </ScreenContent>
  </BaseScreenComponent>
);
