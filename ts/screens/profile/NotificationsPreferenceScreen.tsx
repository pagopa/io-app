import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { List } from "native-base";
import { PreferenceListItem } from "../../components/PreferenceListItem";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { RemoteSwitch } from "../../components/core/selection/RemoteSwitch";

export const NotificationsPreferenceScreen = () => (
  <TopScreenComponent
    goBack={true}
    headerTitle={I18n.t("profile.preferences.notifications.header")}
  >
    <ScreenContent
      title={I18n.t("profile.preferences.notifications.title")}
      subtitle={I18n.t("profile.preferences.notifications.subtitle")}
    >
      <List withContentLateralPadding={true}>
        <PreferenceListItem
          title={I18n.t("profile.preferences.notifications.reminders.title")}
          description={I18n.t(
            "profile.preferences.notifications.reminders.description"
          )}
          rightElement={<RemoteSwitch value={pot.some(false)}></RemoteSwitch>}
        />
      </List>
    </ScreenContent>
  </TopScreenComponent>
);
