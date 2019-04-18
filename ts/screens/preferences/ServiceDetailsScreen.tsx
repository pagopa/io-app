import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Col, Content, Grid, H2, Row, Text, View } from "native-base";
import * as React from "react";
import {
  Clipboard,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import Markdown from "../../components/ui/Markdown";
import { MultiImage } from "../../components/ui/MultiImage";
import Switch from "../../components/ui/Switch";

import I18n from "../../i18n";

import { profileUpsert } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
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

import { logosForService } from "../../utils/services";
import { showToast } from "../../utils/showToast";

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;

interface State {
  uiEnabledChannels: EnabledChannels;
  updateStatus: pot.Pot<true, string>;
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
    height: 50,
    alignSelf: "flex-start"
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
        <Text ellipsizeMode="tail" numberOfLines={1}>
          {info}
        </Text>
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
    const serviceId = this.props.navigation.getParam("service").service_id;
    this.state = {
      uiEnabledChannels: getEnabledChannelsForService(
        this.props.profile,
        serviceId
      ),
      updateStatus: pot.none
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (pot.isError(this.props.profile) !== pot.isError(nextProps.profile)) {
      // in case of new or resolved errors while updating the profile, we show a toast and
      // reset the UI to match the state of the profile preferences
      showToast(
        I18n.t("serviceDetail.onUpdateEnabledChannelsFailure"),
        "danger"
      );
      this.setState({
        uiEnabledChannels: getEnabledChannelsForService(
          nextProps.profile,
          nextProps.navigation.getParam("service").service_id
        ),
        updateStatus: pot.noneError("error")
      });
    } else if (!pot.isUpdating(nextProps.profile)) {
      // we are here when the update process ends
      this.setState({
        updateStatus: pot.some(true)
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
      this.props.navigation.getParam("service").service_id
    );

    // compute the new blocked channels preference for the user profile
    const newblockedChannels = updatedBlockedChannels(newUiEnabledChannels);

    // dispatch a request to update the profile with the new
    // blocked channels
    this.props.dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newblockedChannels
      })
    );
  }

  private updateChannels = (newUiEnabledChannels: EnabledChannels) => {
    // previous update is still running, do nothing
    // this check is to prevent user double tap on
    // switch while its animation is running
    if (pot.isLoading(this.state.updateStatus)) {
      return;
    }
    this.setState({
      uiEnabledChannels: newUiEnabledChannels,
      updateStatus: pot.noneLoading
    });
    // dispatch the update of the profile from the new prefs
    this.dispatchNewEnabledChannels(newUiEnabledChannels);
  };

  // tslint:disable-next-line:cognitive-complexity no-big-function
  public render() {
    // collect the service
    const service = this.props.navigation.getParam("service");
    const serviceId = service.service_id;

    // finds out which channels are enabled in the user profile
    const profileEnabledChannels = getEnabledChannelsForService(
      this.props.profile,
      serviceId
    );

    // collect the service metadata
    const potServiceMetadata =
      this.props.content.servicesMetadata.byId[serviceId] || pot.none;

    const serviceMetadata = pot.getOrElse(potServiceMetadata, {} as pot.PotType<
      typeof potServiceMetadata
    >);

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
    const profileVersion = pot
      .toOption(this.props.profile)
      .mapNullable(_ => (_.has_profile ? _.version : null))
      .getOrElse(0 as NonNegativeInteger);

    // URIs for the service logo
    const logoUris = logosForService(service);

    return (
      <BaseScreenComponent
        goBack={this.goBack}
        headerTitle={I18n.t("serviceDetail.headerTitle")}
      >
        <Content>
          <Grid>
            <Row>
              <Col>
                <H4>{service.organization_name}</H4>
                <H2>{service.service_name}</H2>
              </Col>
              <Col style={{ width: 60 }}>
                <MultiImage
                  style={{ width: 60, height: 60 }}
                  source={logoUris}
                />
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
                      this.state.uiEnabledChannels.inbox ||
                    pot.isLoading(this.state.updateStatus)
                  }
                  onValueChange={(value: boolean) => {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      inbox: value
                    };
                    this.updateChannels(newUiEnabledChannels);
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
                  disabled={
                    !this.state.uiEnabledChannels.inbox ||
                    pot.isLoading(this.state.updateStatus)
                  }
                  onValueChange={(value: boolean) => {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      push: value
                    };
                    this.updateChannels(newUiEnabledChannels);
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
                  disabled={
                    !this.state.uiEnabledChannels.inbox ||
                    pot.isLoading(this.state.updateStatus)
                  }
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
                    this.updateChannels(newUiEnabledChannels);
                  }}
                />
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {description && <Markdown animated={true}>{description}</Markdown>}
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
                  <Text ellipsizeMode="tail" numberOfLines={1}>
                    {web_url}
                  </Text>
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
            {this.props.isDebugModeEnabled &&
              renderInformationRow("ID", service.service_id, () =>
                Clipboard.setString(service.service_id)
              )}
            <View spacer={true} large={true} />
          </Grid>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  services: state.entities.services,
  content: state.content,
  profile: state.profile,
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
