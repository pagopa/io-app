import {
  Body,
  Container,
  Content,
  H1,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, Alert } from "react-native";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";

import { fromNullable, Option } from "fp-ts/lib/Option";

import I18n from "../i18n";

import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";

import { FetchRequestActions } from "../store/actions/constants";
import { ReduxProps } from "../store/actions/types";
import { createErrorSelector } from "../store/reducers/error";
import { createLoadingSelector } from "../store/reducers/loading";
import { GlobalState } from "../store/reducers/types";

import ScreenHeader from "../components/ScreenHeader";
import AppHeader from "../components/ui/AppHeader";
import IconFont from "../components/ui/IconFont";

import { ProfileWithOrWithoutEmail } from "../api/backend";

type ReduxMappedProps = {
  maybeProfile: Option<ProfileWithOrWithoutEmail>;
  isProfileLoading: boolean;
  isProfileLoadingError: Option<string>;
  isProfileUpserting: boolean;
  isProfileUpsertingError: Option<string>;
};

export type Props = ReduxMappedProps & ReduxProps;

interface PreferenceItemBaseProps {
  title: string;
  valuePreview: string;
}

interface PreferenceItemIconProps extends PreferenceItemBaseProps {
  kind: "value";
  icon: ImageSourcePropType;
}

interface PreferenceItemActionProps extends PreferenceItemBaseProps {
  kind: "action";
  onClick: () => void;
}

type PreferenceItemProps = PreferenceItemIconProps | PreferenceItemActionProps;

const PreferenceItem: React.SFC<PreferenceItemProps> = props => (
  <ListItem>
    <Left>
      <H3>{props.title}</H3>
      <Text>{props.valuePreview}</Text>
    </Left>
    <Right>
      {props.kind === "value" ? (
        <Image source={props.icon} />
      ) : props.kind === "action" ? (
        <IconFont name="io-right" onClick={() => props.onClick()} />
      ) : null}
    </Right>
  </ListItem>
);

const StyledPreferenceItem = connectStyle(
  "UIComponent.PreferenceItem",
  {},
  mapPropsToStyleNames
)(PreferenceItem);

/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language and digital address.
 */
class PreferencesScreen extends React.Component<Props> {
  public render() {
    const maybeProfile = this.props.maybeProfile;

    const profilePreview = maybeProfile
      .map(_ => ({
        spid_email: _.spid_email as string,
        language: _.preferred_languages
          ? _.preferred_languages.join(",")
          : I18n.t("preferences.empty.default")
      }))
      .getOrElse({
        spid_email: "-",
        language: "-"
      });

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
            <View>
              <List>
                <StyledPreferenceItem
                  kind="value"
                  title={I18n.t("preferences.list.email")}
                  icon={require("../../img/wallet/icon-avviso-pagopa.png")}
                  valuePreview={profilePreview.spid_email}
                />
                <StyledPreferenceItem
                  kind="action"
                  title={I18n.t("preferences.list.services")}
                  valuePreview={I18n.t("preferences.list.services_description")}
                  onClick={() => {
                    Alert.alert("Not implemented yet");
                  }}
                />
                <StyledPreferenceItem
                  kind="value"
                  title={I18n.t("preferences.list.language")}
                  icon={require("../../img/wallet/icon-avviso-pagopa.png")}
                  valuePreview={profilePreview.language}
                />
                <StyledPreferenceItem
                  kind="value"
                  title={I18n.t("preferences.list.digitalDomicile")}
                  icon={require("../../img/wallet/icon-avviso-pagopa.png")}
                  valuePreview={I18n.t("preferences.empty.default")}
                />
                <StyledPreferenceItem
                  kind="value"
                  title="IBAN"
                  icon={require("../../img/wallet/icon-avviso-pagopa.png")}
                  valuePreview={I18n.t("preferences.empty.default")}
                />
              </List>
            </View>
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
