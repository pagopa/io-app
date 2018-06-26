import { Container, Content, H1, Text, View } from "native-base";
import * as React from "react";
import { Image } from "react-native";
import PreferenceList from "../../components/PreferencesList";
import I18n from "../../i18n";
import { PreferenceItem } from "../../types/PreferenceItem";
import ownStyles from "./PreferencesScreen.styles";

const preferences: ReadonlyArray<PreferenceItem> = [
  {
    id: "email",
    icon: require("../../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "mario.rossi@postaelettronica.it"
  },
  {
    id: "servicesNotifications",
    icon: require("../../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Inps, Comune di Venezia, ..."
  },
  {
    id: "language",
    icon: require("../../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Italiano"
  },
  {
    id: "digitalDomicile",
    icon: require("../../../img/wallet/icon-avviso-pagopa.png"),
    valuePreview: "Nessuna preferenza impostata"
  }
];

const PreferencesScreen: React.SFC = () => (
  <Container>
    <Content noPadded={true}>
      <View content={true}>
        <View style={ownStyles.headerContainer}>
          <H1>{I18n.t("preferences.title")}</H1>
          <Image
            source={require("../../../img/icons/gears.png")}
            style={ownStyles.icon}
          />
        </View>

        <Text>{I18n.t("preferences.subtitle")}</Text>
        <Text link={true}>{I18n.t("preferences.moreLinkText")}</Text>

        <View spacer={true} />
        <PreferenceList preferences={preferences} />
      </View>
    </Content>
  </Container>
);

export default PreferencesScreen;
