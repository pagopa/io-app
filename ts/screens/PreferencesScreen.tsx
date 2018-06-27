import { Body, Container, Content, H1, Text, View } from "native-base";
import * as React from "react";
import PreferenceList from "../components/PreferencesList";
import ScreenHeader from "../components/ScreenHeader";
import AppHeader from "../components/ui/AppHeader";
import I18n from "../i18n";
import { PreferenceItem } from "../types/PreferenceItem";

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

const PreferencesScreen: React.SFC = () => (
  <Container>
    <AppHeader>
      <Body>
        <Text>{I18n.t("global.app.title")}</Text>
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

export default PreferencesScreen;
