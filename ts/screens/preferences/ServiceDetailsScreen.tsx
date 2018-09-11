import { Button, Col, Content, Grid, H2, Row, Text, View } from "native-base";
import * as React from "react";
import {
  Clipboard,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable, Option } from "fp-ts/lib/Option";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import Markdown from "../../components/ui/Markdown";
import Switch from "../../components/ui/Switch";

import I18n from "../../i18n";

import { profileUpsertRequest } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import { ContentState } from "../../store/reducers/content";
import { ServicesState } from "../../store/reducers/entities/services";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

import {
  EnabledChannels,
  getBlockedChannels,
  getEnabledChannelsForService
} from "./common";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
import customVariables from "../../theme/variables";

export interface IMessageDetailsScreenParam {
  readonly service: ServicePublic;
}

interface INavigationStateWithParams extends NavigationState {
  readonly params: IMessageDetailsScreenParam;
}

type ReduxMappedProps = Readonly<{
  services: ServicesState;
  content: ContentState;
  profile: ProfileState;
  profileUpsertError: Option<string>;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<INavigationStateWithParams>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

interface State {
  uiEnabledChannels: EnabledChannels;
}

const styles = StyleSheet.create({
  infoHeader: {
    marginTop: customVariables.spacerLargeHeight
  },
  infoItem: {
    flexDirection: "column",
    marginTop: customVariables.spacerHeight
  },
  badgeLogo: {
    width: 150,
    height: 50
  }
});

/**
 * Renders a row in the service information panel
 */
function renderInformationRow(
  label: string,
  info: string,
  onPress?: () => void
) {
  return (
    <View style={styles.infoItem}>
      <Text>{label}</Text>
      <Button primary={true} small={true} onPress={onPress}>
        <Text>{info}</Text>
      </Button>
    </View>
  );
}

class ServiceDetailsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // We initialize the UI by making the states of the channels the same
    // as what is set in the profile. The user will be able to change the state
    // via the UI and the profile will be updated in the background accordingly.
    const serviceId = this.props.navigation.state.params.service.service_id;
    this.state = {
      uiEnabledChannels: getEnabledChannelsForService(
        this.props.profile,
        serviceId
      )
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.profileUpsertError !== nextProps.profileUpsertError) {
      // in case of new or resolved errors while updating the profile, we reset
      // the UI to match the state of the profile preferences
      this.setState({
        uiEnabledChannels: getEnabledChannelsForService(
          nextProps.profile,
          nextProps.navigation.state.params.service.service_id
        )
      });
    }
  }

  private goBack = () => this.props.navigation.goBack();

  /**
   * Dispatches a profileUpsertRequest to trigger an asynchronous update of the
   * profile with the new enabled channels
   */
  private dispatchNewEnabledChannels(newUiEnabledChannels: EnabledChannels) {
    const updatedBlockedChannels = getBlockedChannels(
      this.props.profile,
      this.props.navigation.state.params.service.service_id
    );

    // compute the new blocked channels preference for the user profile
    const newblockedChannels = updatedBlockedChannels(newUiEnabledChannels);

    // dispatch a request to update the profile with the new
    // blocked channels
    this.props.dispatch(
      profileUpsertRequest({
        blocked_inbox_or_channels: newblockedChannels
      })
    );
  }

  // tslint:disable-next-line:cognitive-complexity no-big-function
  public render() {
    // collect the service
    const service = this.props.navigation.state.params.service;

    // finds out which channels are enabled in the user profile
    const profileEnabledChannels = getEnabledChannelsForService(
      this.props.profile,
      service.service_id
    );

    // collect the service metadata
    const serviceMetadata = fromNullable(
      this.props.content.servicesMetadata.byId[service.service_id]
    ).getOrElse({});

    const {
      description,
      web_url,
      app_ios,
      app_android,
      tos_url,
      privacy_url,
      address,
      phone,
      email,
      pec
    } = serviceMetadata;

    // whether last attempt to save the preferences failed
    const profileVersion = fromNullable(this.props.profile)
      .mapNullable(_ => (_.has_profile ? _.version : null))
      .getOrElse(0 as NonNegativeInteger);

    return (
      <BaseScreenComponent
        goBack={this.goBack}
        headerTitle={service.service_name}
      >
        <Content>
          <Grid>
            <Row>
              <Col>
                <H4>{service.organization_name}</H4>
                <H2>{service.service_name}</H2>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Col size={10}>
                <Text
                  primary={
                    profileEnabledChannels.inbox !==
                    this.state.uiEnabledChannels.inbox
                  }
                >
                  {profileEnabledChannels.inbox
                    ? I18n.t("services.serviceIsEnabled")
                    : I18n.t("services.serviceNotEnabled")}
                </Text>
              </Col>
              <Col size={2}>
                <Switch
                  key={`switch-inbox-${profileVersion}`}
                  value={this.state.uiEnabledChannels.inbox}
                  disabled={
                    profileEnabledChannels.inbox !==
                    this.state.uiEnabledChannels.inbox
                  }
                  onValueChange={(value: boolean) => {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      inbox: value
                    };

                    // dispatch the update of the profile from the new prefs
                    this.dispatchNewEnabledChannels(newUiEnabledChannels);

                    // optimistically update the UI while we wait for the
                    // profile to update
                    this.setState({
                      uiEnabledChannels: newUiEnabledChannels
                    });
                  }}
                />
              </Col>
            </Row>
            <View spacer={true} />
            <Row>
              <Col size={1} />
              <Col size={9}>
                <Text
                  primary={
                    profileEnabledChannels.push !==
                    this.state.uiEnabledChannels.push
                  }
                >
                  {I18n.t("services.pushNotifications")}
                </Text>
              </Col>
              <Col size={2}>
                <Switch
                  key={`switch-push-${profileVersion}`}
                  value={
                    this.state.uiEnabledChannels.inbox &&
                    this.state.uiEnabledChannels.push
                  }
                  disabled={!this.state.uiEnabledChannels.inbox}
                  onValueChange={(value: boolean) => {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      push: value
                    };

                    // dispatch the update of the profile from the new prefs
                    this.dispatchNewEnabledChannels(newUiEnabledChannels);

                    // optimistically update the UI while we wait for the
                    // profile to update
                    this.setState({
                      uiEnabledChannels: newUiEnabledChannels
                    });
                  }}
                />
              </Col>
            </Row>
            <View spacer={true} />
            <Row>
              <Col size={1} />
              <Col size={9}>
                <Text
                  primary={
                    profileEnabledChannels.email !==
                    this.state.uiEnabledChannels.email
                  }
                >
                  {I18n.t("services.emailNotifications")}
                </Text>
              </Col>
              <Col size={2}>
                <Switch
                  key={`switch-email-${profileVersion}`}
                  disabled={!this.state.uiEnabledChannels.inbox}
                  value={
                    this.state.uiEnabledChannels.inbox &&
                    this.state.uiEnabledChannels.email
                  }
                  onValueChange={(value: boolean) => {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      email: value
                    };

                    // dispatch the update of the profile from the new prefs
                    this.dispatchNewEnabledChannels(newUiEnabledChannels);

                    // optimistically update the UI while we wait for the
                    // profile to update
                    this.setState({
                      uiEnabledChannels: newUiEnabledChannels
                    });
                  }}
                />
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {description && (
              <Markdown lazy={true} animated={true}>
                {description}
              </Markdown>
            )}
            {description && <View spacer={true} large={true} />}
            {tos_url && (
              <TouchableOpacity
                style={styles.infoItem}
                onPress={() => Linking.openURL(tos_url).then(() => 0, () => 0)}
              >
                <Text link={true}>{I18n.t("services.tosLink")}</Text>
              </TouchableOpacity>
            )}
            {privacy_url && (
              <TouchableOpacity
                style={styles.infoItem}
                onPress={() =>
                  Linking.openURL(privacy_url).then(() => 0, () => 0)
                }
              >
                <Text link={true}>{I18n.t("services.privacyLink")}</Text>
              </TouchableOpacity>
            )}
            {(app_android || app_ios || web_url) && (
              <H4 style={styles.infoHeader}>
                {I18n.t("services.otherAppsInfo")}
              </H4>
            )}
            {web_url && (
              <View style={styles.infoItem}>
                <Text>{I18n.t("services.otherAppWeb")}</Text>
                <Button
                  small={true}
                  onPress={() =>
                    Linking.openURL(web_url).then(() => 0, () => 0)
                  }
                >
                  <Text>{web_url}</Text>
                </Button>
              </View>
            )}
            {app_ios && (
              <View style={styles.infoItem}>
                <Text>{I18n.t("services.otherAppIos")}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(app_ios).then(() => 0, () => 0)
                  }
                >
                  <Image
                    style={styles.badgeLogo}
                    alignSelf="flex-start"
                    resizeMode="contain"
                    source={require("../../../img/badges/app-store-badge.png")}
                  />
                </TouchableOpacity>
              </View>
            )}
            {app_android && (
              <View style={styles.infoItem}>
                <Text>{I18n.t("services.otherAppAndroid")}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(app_android).then(() => 0, () => 0)
                  }
                >
                  <Image
                    style={styles.badgeLogo}
                    resizeMode="contain"
                    source={require("../../../img/badges/google-play-badge.png")}
                  />
                </TouchableOpacity>
              </View>
            )}
            <H4 style={styles.infoHeader}>
              {I18n.t("services.contactsAndInfo")}
            </H4>
            {renderInformationRow(
              "C.F.",
              service.organization_fiscal_code,
              () => Clipboard.setString(service.organization_fiscal_code)
            )}
            {address &&
              renderInformationRow(
                I18n.t("services.contactAddress"),
                address,
                () => Clipboard.setString(address)
              )}
            {phone &&
              renderInformationRow(I18n.t("services.contactPhone"), phone, () =>
                Linking.openURL(`tel:${phone}`).then(() => 0, () => 0)
              )}
            {email &&
              renderInformationRow("EMail", email, () =>
                Linking.openURL(`mailto:${email}`).then(() => 0, () => 0)
              )}
            {pec && renderInformationRow("PEC", pec)}
            {web_url &&
              renderInformationRow("Web", web_url, () =>
                Linking.openURL(web_url).then(() => 0, () => 0)
              )}
            {renderInformationRow("ID", service.service_id, () =>
              Clipboard.setString(service.service_id)
            )}
            <View spacer={true} large={true} />
          </Grid>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  services: state.entities.services,
  content: state.content,
  profile: state.profile,
  profileUpsertError: state.error.PROFILE_UPSERT
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
