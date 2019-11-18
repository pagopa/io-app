/**
 * Screen displaying the details of a selected service. The user
 * can enable/disable the service and customize the notification settings.
 */
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Col, Content, Grid, H2, Row, Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import { MultiImage } from "../../components/ui/MultiImage";
import Switch from "../../components/ui/Switch";
import { isEmailEditingAndValidationEnabled } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { serviceAlertDisplayedOnceSuccess } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import { isCustomEmailChannelEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { openMaps } from "../../utils/openMaps";
import {
  EnabledChannels,
  getBlockedChannels,
  getEnabledChannelsForService
} from "../../utils/profile";
import { logosForService } from "../../utils/services";
import { showToast } from "../../utils/showToast";

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;

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
    height: 50,
    alignSelf: "flex-start"
  },
  switchRow: {
    justifyContent: "space-between",
    paddingVertical: 12
  },
  otherSwitchRow: {
    paddingLeft: 8,
    borderTopColor: customVariables.itemSeparator,
    borderTopWidth: 1 / 3
  },
  flexRow: {
    flexDirection: "row"
  },
  enabledColor: {
    color: customVariables.brandDarkestGray
  },
  disabledColor: {
    color: customVariables.disabledService
  },
  info: {
    marginTop: -5
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
        <Text uppercase={false} ellipsizeMode="tail" numberOfLines={1}>
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
      )
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (pot.isError(nextProps.profile) && !pot.isError(this.props.profile)) {
      // in case of new or resolved errors while updating the profile, we show a toast and
      // reset the UI to match the state of the profile preferences
      showToast(
        I18n.t("serviceDetail.onUpdateEnabledChannelsFailure"),
        "danger"
      );

      const uiEnabledChannels = getEnabledChannelsForService(
        nextProps.profile,
        nextProps.navigation.getParam("service").service_id
      );
      this.setState({
        uiEnabledChannels
      });
    }
  }

  private goBack = () => this.props.navigation.goBack();

  // collect the service
  private service = this.props.navigation.getParam("service");
  private serviceId = this.service.service_id;

  // finds out which channels are enabled in the user profile
  private profileEnabledChannels = getEnabledChannelsForService(
    this.props.profile,
    this.serviceId
  );

  // whether last attempt to save the preferences failed
  private profileVersion = pot
    .toOption(this.props.profile)
    .mapNullable(_ => (_.has_profile ? _.version : null))
    .getOrElse(0 as NonNegativeInteger);

  // URIs for the service logo
  private logoUris = logosForService(this.service);

  /**
   * Dispatches a profileUpsertRequest to trigger an asynchronous update of the
   * profile with the new enabled channels
   */
  private dispatchNewEnabledChannels(newUiEnabledChannels: EnabledChannels) {
    // if a previous update is still running, do nothing
    // this check is to prevent user double tap on
    // switch while its animation is running
    if (pot.isUpdating(this.props.profile)) {
      return;
    }
    this.setState({
      uiEnabledChannels: newUiEnabledChannels
    });

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

  // show an alert describing what happen if a service is disabled on IO
  // the alert is displayed only the first time the user disable a service
  private showAlertOnServiceDisabling = () => {
    Alert.alert(
      I18n.t("serviceDetail.disableTitle"),
      I18n.t("serviceDetail.disableMsg"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.ok"),
          style: "destructive",
          onPress: () => {
            // compute the updated map of enabled channels
            const newUiEnabledChannels = {
              ...this.state.uiEnabledChannels,
              inbox: false
            };
            this.dispatchNewEnabledChannels(newUiEnabledChannels);

            // update the persisted preferences to remember the user read the alert
            this.props.dispatch(
              serviceAlertDisplayedOnceSuccess({
                wasServiceAlertDisplayedOnce: true
              })
            );
          }
        }
      ],
      { cancelable: false }
    );
  };

  private navigateToEmailPreferences = () =>
    this.props.navigation.navigate(ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING);

  // tslint:disable-next-line:cognitive-complexity no-big-function
  public render() {
    const {
      service,
      serviceId,
      profileEnabledChannels,
      profileVersion,
      logoUris
    } = this;

    // collect the service metadata
    const potServiceMetadata =
      this.props.content.servicesMetadata.byId[serviceId] || pot.none;

    const serviceMetadata = pot.getOrElse(potServiceMetadata, {} as pot.PotType<
      typeof potServiceMetadata
    >);

    const messageForwardingState =
      this.state.uiEnabledChannels.inbox && this.state.uiEnabledChannels.email
        ? I18n.t("serviceDetail.enabled")
        : I18n.t("serviceDetail.disabled");

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
            <Row style={styles.switchRow}>
              <Text
                primary={
                  profileEnabledChannels.inbox !==
                  this.state.uiEnabledChannels.inbox
                }
                bold={true}
                style={
                  this.state.uiEnabledChannels.inbox
                    ? styles.enabledColor
                    : styles.disabledColor
                }
              >
                {profileEnabledChannels.inbox
                  ? I18n.t("services.serviceIsEnabled")
                  : I18n.t("services.serviceNotEnabled")}
              </Text>
              <Switch
                key={`switch-inbox-${profileVersion}`}
                value={this.state.uiEnabledChannels.inbox}
                disabled={
                  profileEnabledChannels.inbox !==
                    this.state.uiEnabledChannels.inbox ||
                  pot.isUpdating(this.props.profile)
                }
                onValueChange={(value: boolean) => {
                  if (!value && !this.props.wasServiceAlertDisplayedOnce) {
                    this.showAlertOnServiceDisabling();
                  } else {
                    // compute the updated map of enabled channels
                    const newUiEnabledChannels = {
                      ...this.state.uiEnabledChannels,
                      inbox: value
                    };
                    this.dispatchNewEnabledChannels(newUiEnabledChannels);
                  }
                }}
              />
            </Row>
            <Row style={[styles.switchRow, styles.otherSwitchRow]}>
              <Text
                primary={
                  profileEnabledChannels.push !==
                  this.state.uiEnabledChannels.push
                }
                bold={true}
                style={
                  this.state.uiEnabledChannels.inbox &&
                  this.state.uiEnabledChannels.push
                    ? styles.enabledColor
                    : styles.disabledColor
                }
              >
                {I18n.t("services.pushNotifications")}
              </Text>
              <Switch
                key={`switch-push-${profileVersion}`}
                value={
                  this.state.uiEnabledChannels.inbox &&
                  this.state.uiEnabledChannels.push
                }
                disabled={
                  !this.state.uiEnabledChannels.inbox ||
                  pot.isUpdating(this.props.profile)
                }
                onValueChange={(value: boolean) => {
                  // compute the updated map of enabled channels
                  const newUiEnabledChannels = {
                    ...this.state.uiEnabledChannels,
                    push: value
                  };
                  this.dispatchNewEnabledChannels(newUiEnabledChannels);
                }}
              />
            </Row>
            <Row style={[styles.switchRow, styles.otherSwitchRow]}>
              <View style={styles.flexRow}>
                {!this.props.isCustomEmailChannelEnabled && (
                  <IconFont
                    name={"io-lucchetto"}
                    color={customVariables.brandDarkGray}
                  />
                )}
                <Text
                  primary={
                    profileEnabledChannels.email !==
                    this.state.uiEnabledChannels.email
                  }
                  bold={true}
                  style={
                    this.state.uiEnabledChannels.inbox &&
                    this.state.uiEnabledChannels.email &&
                    this.props.isCustomEmailChannelEnabled
                      ? styles.enabledColor
                      : styles.disabledColor
                  }
                >
                  {I18n.t("services.emailForwarding")}
                </Text>
              </View>
              <Switch
                key={`switch-email-${profileVersion}`}
                disabled={
                  !this.state.uiEnabledChannels.inbox ||
                  pot.isUpdating(this.props.profile) ||
                  !this.props.isValidEmail ||
                  !this.props.isCustomEmailChannelEnabled
                }
                value={
                  this.state.uiEnabledChannels.inbox &&
                  this.state.uiEnabledChannels.email &&
                  this.props.isValidEmail
                }
                onValueChange={(value: boolean) => {
                  // compute the updated map of enabled channels
                  const newUiEnabledChannels = {
                    ...this.state.uiEnabledChannels,
                    email: value
                  };
                  this.dispatchNewEnabledChannels(newUiEnabledChannels);
                }}
              />
            </Row>
            {!this.props.isCustomEmailChannelEnabled && (
              <Row style={styles.info}>
                <Text>
                  {I18n.t("serviceDetail.lockedMailAlert", {
                    enabled: messageForwardingState
                  })}
                  <Text link={true} onPress={this.navigateToEmailPreferences}>
                    {` ${I18n.t("serviceDetail.updatePreferences")}`}
                  </Text>
                </Text>
              </Row>
            )}
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
              () =>
                clipboardSetStringWithFeedback(service.organization_fiscal_code)
            )}
            {address &&
              renderInformationRow(
                I18n.t("services.contactAddress"),
                address,
                () => {
                  openMaps(address);
                }
              )}
            {phone &&
              renderInformationRow(I18n.t("services.contactPhone"), phone, () =>
                Linking.openURL(`tel:${phone}`).then(() => 0, () => 0)
              )}
            {email &&
              renderInformationRow("Email", email, () =>
                Linking.openURL(`mailto:${email}`).then(() => 0, () => 0)
              )}
            {pec &&
              renderInformationRow("PEC", pec, () =>
                Linking.openURL(`mailto:${pec}`).then(() => 0, () => 0)
              )}
            {web_url &&
              renderInformationRow("Web", web_url, () =>
                Linking.openURL(web_url).then(() => 0, () => 0)
              )}
            {this.props.isDebugModeEnabled &&
              renderInformationRow("ID", service.service_id, () =>
                clipboardSetStringWithFeedback(service.service_id)
              )}
            <View spacer={true} extralarge={true} />
          </Grid>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potIsCustomEmailChannelEnabled = isCustomEmailChannelEnabledSelector(
    state
  );
  return {
    isValidEmail: !isEmailEditingAndValidationEnabled && !!state, // TODO: get the proper isValidEmail from store
    services: state.entities.services,
    content: state.content,
    profile: state.profile,
    isDebugModeEnabled: state.debug.isDebugModeEnabled,
    wasServiceAlertDisplayedOnce:
      state.persistedPreferences.wasServiceAlertDisplayedOnce,
    isCustomEmailChannelEnabled: potIsCustomEmailChannelEnabled.isSome()
      ? potIsCustomEmailChannelEnabled.value
      : false
  };
};

export default connect(mapStateToProps)(ServiceDetailsScreen);
