import * as pot from "italia-ts-commons/lib/pot";
import { Content, List, ListItem } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable } from "fp-ts/lib/Option";

import { untag } from "italia-ts-commons/lib/types";

import I18n from "../../i18n";

import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import PreferenceItem from "../../components/PreferenceItem";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";

import ROUTES from "../../navigation/routes";

import { getLocalePrimary } from "../../utils/locale";

const unavailableAlert = () =>
  Alert.alert(
    I18n.t("preferences.unavailable.title"),
    I18n.t("preferences.unavailable.message")
  );

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;

/**
 * Translates the primary languages of the provided locales.
 *
 * If a locale is not in the XX-YY format, it will be skipped.
 * If the primary language of a locale doesn't have a translation,
 * it gets returned verbatim.
 */
function translateLocale(locale: string): string {
  return getLocalePrimary(locale)
    .map(l => I18n.t(`locales.${l}`, { defaultValue: l }))
    .getOrElse(locale);
}

/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language and digital address.
 */
class PreferencesScreen extends React.Component<Props> {
  public render() {
    const contextualHelp = {
      title: I18n.t("preferences.title"),
      body: () => <Markdown>{I18n.t("preferences.preferencesHelp")}</Markdown>
    };

    const { potProfile } = this.props;

    const profileData = potProfile
      .map(_ => ({
        spid_email: untag(_.spid_email),
        spid_mobile_phone: untag(_.spid_mobile_phone)
      }))
      .getOrElse({
        spid_email: I18n.t("global.remoteStates.notAvailable"),
        spid_mobile_phone: I18n.t("global.remoteStates.notAvailable")
      });

    const languages = this.props.languages
      .filter(_ => _.length > 0)
      .map(_ => translateLocale(_[0]))
      .getOrElse(I18n.t("global.remoteStates.notAvailable"));

    return (
      <TopScreenComponent
        title={I18n.t("preferences.title")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("preferences.subtitle")}
        contextualHelp={contextualHelp}
      >
        <Content noPadded={true}>
          <List withContentLateralPadding={true}>
            <ListItem
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICES)
              }
            >
              <PreferenceItem
                kind="action"
                title={I18n.t("preferences.list.services")}
                valuePreview={I18n.t("preferences.list.services_description")}
              />
            </ListItem>
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.email")}
                icon="io-email"
                valuePreview={profileData.spid_email}
              />
            </ListItem>
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.mobile_phone")}
                icon="io-phone-number"
                valuePreview={profileData.spid_mobile_phone}
              />
            </ListItem>
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.language")}
                icon="io-languages"
                valuePreview={languages}
              />
            </ListItem>
          </List>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  languages: fromNullable(state.preferences.languages),
  potProfile: pot.toOption(state.profile)
});

export default connect(mapStateToProps)(PreferencesScreen);
