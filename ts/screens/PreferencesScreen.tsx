import { Body, Container, Content, H1, Text, View } from "native-base";
import * as React from "react";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";

import { fromNullable, Option } from "fp-ts/lib/Option";

import { FetchRequestActions } from "../store/actions/constants";
import { ReduxProps } from "../store/actions/types";
import { createErrorSelector } from "../store/reducers/error";
import { createLoadingSelector } from "../store/reducers/loading";
import { GlobalState } from "../store/reducers/types";

import PreferenceList from "../components/PreferencesList";
import ScreenHeader from "../components/ScreenHeader";
import AppHeader from "../components/ui/AppHeader";

import I18n from "../i18n";

import { PreferenceItem } from "../types/PreferenceItem";

import { ProfileWithOrWithoutEmail } from "../api/backend";

type ReduxMappedProps = {
  maybeProfile: Option<ProfileWithOrWithoutEmail>;
  isProfileLoading: boolean;
  isProfileLoadingError: Option<string>;
  isProfileUpserting: boolean;
  isProfileUpsertingError: Option<string>;
};

export type Props = ReduxMappedProps & ReduxProps;

const preferences: ReadonlyArray<PreferenceItem> = [
  {
    id: "email",
    icon: require("../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "mario.rossi@postaelettronica.it"
  },
  {
    id: "servicesNotifications",
    icon: require("../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Inps, Comune di Venezia, ..."
  },
  {
    id: "language",
    icon: require("../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Italiano"
  },
  {
    id: "digitalDomicile",
    icon: require("../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Nessuna preferenza impostata"
  }
];

/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language and digital address.
 */
class PreferencesScreen extends React.Component<Props> {
  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DeviceInfo.getApplicationName()}</Text>
          </Body>
        </AppHeader>

        <Content>
          <View>
            <ScreenHeader
              heading={<H1>{I18n.t("preferences.title")}</H1>}
              icon={require("../../img/icons/gears.png")}
            />

            <Text>{I18n.t("preferences.subtitle")}</Text>
            <Text link={true}>{I18n.t("preferences.moreLinkText")}</Text>

            <View spacer={true} />
            <PreferenceList preferences={preferences} />
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
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
