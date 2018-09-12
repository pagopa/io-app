import { Content, List } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable, Option } from "fp-ts/lib/Option";

import { untag } from "italia-ts-commons/lib/types";

import I18n from "../../i18n";

import { FetchRequestActions } from "../../store/actions/constants";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";

import PreferenceItem from "../../components/PreferenceItem";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";

import ROUTES from "../../navigation/routes";

import { AuthenticatedOrInitializedProfile } from "../../api/backend";

import { getLocalePrimary } from "../../utils/locale";

type ReduxMappedProps = {
  maybeProfile: Option<AuthenticatedOrInitializedProfile>;
  isProfileLoading: boolean;
  isProfileLoadingError: Option<string>;
  isProfileUpserting: boolean;
  isProfileUpsertingError: Option<string>;
  languages: Option<ReadonlyArray<string>>;
};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

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

    const maybeProfile = this.props.maybeProfile;

    const profileData = maybeProfile
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
        <Content>
          <List>
            <PreferenceItem
              kind="action"
              title={I18n.t("preferences.list.services")}
              valuePreview={I18n.t("preferences.list.services_description")}
              onClick={() =>
                this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICES)
              }
            />
            <PreferenceItem
              kind="value"
              title={I18n.t("preferences.list.email")}
              icon="io-email"
              valuePreview={profileData.spid_email}
            />
            <PreferenceItem
              kind="value"
              title={I18n.t("preferences.list.mobile_phone")}
              icon="io-phone-number"
              valuePreview={profileData.spid_mobile_phone}
            />
            <PreferenceItem
              kind="value"
              title={I18n.t("preferences.list.language")}
              icon="io-languages"
              valuePreview={languages}
            />
          </List>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  languages: fromNullable(state.preferences.languages),
  maybeProfile: fromNullable(state.profile),
  isProfileLoading: createLoadingSelector([FetchRequestActions.PROFILE_LOAD])(
    state
  ),
  isProfileLoadingError: createErrorSelector([
    FetchRequestActions.PROFILE_LOAD
  ])(state),
  isProfileUpserting: createLoadingSelector([
    FetchRequestActions.PROFILE_UPSERT
  ])(state),
  isProfileUpsertingError: createErrorSelector([
    FetchRequestActions.PROFILE_UPSERT
  ])(state)
});

export default connect(mapStateToProps)(PreferencesScreen);
