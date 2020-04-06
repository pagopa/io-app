/**
 * Screen displaying the details of a selected service. The user
 * can enable/disable the service and customize the notification settings.
 */
import { fromNullable } from "fp-ts/lib/Option";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { Col, Content, Grid, H2, Row, Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { NotificationChannelEnum } from "../../../definitions/backend/NotificationChannel";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import H4 from "../../components/ui/H4";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import { MultiImage } from "../../components/ui/MultiImage";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { serviceAlertDisplayedOnceSuccess } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import {
  contentSelector,
  ServiceMetadataState
} from "../../store/reducers/content";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { servicesSelector } from "../../store/reducers/entities/services";
import { wasServiceAlertDisplayedOnceSelector } from "../../store/reducers/persistedPreferences";
import { isCustomEmailChannelEnabledSelector } from "../../store/reducers/persistedPreferences";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import {
  EnabledChannels,
  getBlockedChannels,
  getEnabledChannelsForService
} from "../../utils/profile";
import { logosForService } from "../../utils/services";
import { showToast } from "../../utils/showToast";
import { handleItemOnPress } from "../../utils/url";
import { EmptyListComponent } from "../../components/messages/EmptyListComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReduxProps &
  NavigationInjectedProps<NavigationParams>;

type State = {
  uiEnabledChannels: EnabledChannels;
  isMarkdownLoaded: boolean;
};

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
  },
  imageHeight: {
    height: 60
  },
  imageWidth: {
    width: 60
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "serviceDetail.headerTitle",
  body: "serviceDetail.contextualHelpContent"
};

// Renders a row in the service information panel as a primary block button
function renderInformationRow(
  label: string,
  info: string,
  value: string,
  valueType?: "MAP" | "COPY" | "LINK"
) {
  return (
    <View style={styles.infoItem}>
      <Text>{label}</Text>
      <ButtonDefaultOpacity
        primary={true}
        small={true}
        onPress={handleItemOnPress(value, valueType)}
      >
        <Text uppercase={false} ellipsizeMode={"tail"} numberOfLines={1}>
          {info}
        </Text>
      </ButtonDefaultOpacity>
    </View>
  );
}

// Renders a row in the service information panel as a link
function renderInformationLinkRow(
  info: string,
  value: string,
  valueType?: "MAP" | "COPY" | "LINK"
) {
  return (
    <View style={styles.infoItem}>
      <TouchableDefaultOpacity onPress={handleItemOnPress(value, valueType)}>
        <Text link={true} ellipsizeMode={"tail"} numberOfLines={1}>
          {info}
        </Text>
      </TouchableDefaultOpacity>
    </View>
  );
}

// Renders a row in the service information panel as labelled image
function renderInformationImageRow(
  label: string,
  url: string,
  source: ImageSourcePropType
) {
  return (
    <View style={styles.infoItem}>
      <Text>{label}</Text>
      <TouchableOpacity onPress={handleItemOnPress(url, "LINK")}>
        <Image
          style={styles.badgeLogo}
          resizeMode={"contain"}
          source={source}
        />
      </TouchableOpacity>
    </View>
  );
}

/**
 * return true if markdown is loaded (description is rendered inside a markdown component)
 * return true if description doesn't exists but values are present
 * return false in others cases
 *
 * this behavior is due to markdown loading: it could happen some items overlapped while the
 * markdown content is loading. To avoid this, we wait the loading ends and then the items will
 * be displayed
 */
export const canRenderItems = (
  isMarkdownLoaded: boolean,
  potServiceMetadata: ServiceMetadataState
): boolean => {
  const isServiceMetadataLoaded = pot.getOrElse(
    pot.map(potServiceMetadata, sm => sm !== undefined),
    false
  );
  const hasServiceMetadataDescription = pot.getOrElse(
    pot.map(
      potServiceMetadata,
      sm => sm !== undefined && sm.description !== undefined
    ),
    false
  );
  // if service metadata is loaded
  // return isMarkdownLoaded if it has a defined description field
  // return true otherwise
  if (isServiceMetadataLoaded) {
    return hasServiceMetadataDescription ? isMarkdownLoaded : true;
  }
  return false;
};

class ServiceDetailsScreen extends React.Component<Props, State> {
  get serviceId() {
    return this.props.navigation.getParam("service").service_id;
  }

  constructor(props: Props) {
    super(props);
    // We initialize the UI by making the states of the channels the same
    // as what is set in the profile. The user will be able to change the state
    // via the UI and the profile will be updated in the background accordingly
    this.state = {
      uiEnabledChannels: getEnabledChannelsForService(
        this.props.profile,
        this.serviceId
      ),
      isMarkdownLoaded: false
    };
  }

  public componentDidUpdate(prevProps: Props) {
    if (pot.isError(this.props.profile) && !pot.isError(prevProps.profile)) {
      // in case of new or resolved errors while updating the profile, we show a toast and
      // reset the UI to match the state of the profile preferences
      showToast(
        I18n.t("serviceDetail.onUpdateEnabledChannelsFailure"),
        "danger"
      );

      const uiEnabledChannels = getEnabledChannelsForService(
        this.props.profile,
        this.props.navigation.getParam("service").service_id
      );
      this.setState({
        uiEnabledChannels
      });
    }
  }

  // collect the service
  private service = this.props.navigation.getParam("service");

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
      this.serviceId
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

  private onMarkdownEnd = () => {
    this.setState({ isMarkdownLoaded: true });
  };

  private renderItems = (potServiceMetadata: ServiceMetadataState) => {
    if (pot.isSome(potServiceMetadata) && potServiceMetadata.value) {
      const metadata = potServiceMetadata.value;
      return (
        <React.Fragment>
          {metadata.description && (
            <Markdown
              animated={true}
              onLoadEnd={this.onMarkdownEnd}
              onError={this.onMarkdownEnd}
            >
              {metadata.description}
            </Markdown>
          )}
          {metadata.description && <View spacer={true} large={true} />}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) && (
            <View>
              {metadata.tos_url &&
                renderInformationLinkRow(
                  I18n.t("services.tosLink"),
                  metadata.tos_url
                )}
              {metadata.privacy_url &&
                renderInformationLinkRow(
                  I18n.t("services.privacyLink"),
                  metadata.privacy_url
                )}
              {(metadata.app_android ||
                metadata.app_ios ||
                metadata.web_url) && (
                <H4 style={styles.infoHeader}>
                  {I18n.t("services.otherAppsInfo")}
                </H4>
              )}
              {metadata.web_url &&
                renderInformationRow(
                  I18n.t("services.otherAppWeb"),
                  metadata.web_url,
                  metadata.web_url
                )}
              {metadata.app_ios &&
                renderInformationImageRow(
                  I18n.t("services.otherAppIos"),
                  metadata.app_ios,
                  require("../../../img/badges/app-store-badge.png")
                )}
              {metadata.app_android &&
                renderInformationImageRow(
                  I18n.t("services.otherAppAndroid"),
                  metadata.app_android,
                  require("../../../img/badges/google-play-badge.png")
                )}
            </View>
          )}
        </React.Fragment>
      );
    }
    return undefined;
  };

  private renderContactItems = (potServiceMetadata: ServiceMetadataState) => {
    if (pot.isSome(potServiceMetadata) && potServiceMetadata.value) {
      const metadata = potServiceMetadata.value;
      return (
        <React.Fragment>
          {metadata.address &&
            renderInformationRow(
              I18n.t("services.contactAddress"),
              metadata.address,
              metadata.address,
              "MAP"
            )}
          {metadata.phone &&
            renderInformationRow(
              I18n.t("services.contactPhone"),
              metadata.phone,
              `tel:${metadata.phone}`
            )}
          {metadata.email &&
            renderInformationRow(
              "Email",
              metadata.email,
              `mailto:${metadata.email}`
            )}
          {metadata.pec &&
            renderInformationRow("PEC", metadata.pec, `mailto:${metadata.pec}`)}
          {metadata.web_url &&
            renderInformationRow("Web", metadata.web_url, metadata.web_url)}
        </React.Fragment>
      );
    }
    return undefined;
  };

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

  // TODO: unify to the ScreenContentHeader
  private getScreenHeader = (
    <Row>
      <Col>
        <H4>{this.service.organization_name}</H4>
        <H2>{this.service.service_name}</H2>
      </Col>
      <Col style={styles.imageWidth}>
        <MultiImage
          style={[styles.imageHeight, styles.imageWidth]}
          source={this.logoUris}
        />
      </Col>
    </Row>
  );

  private getInboxSwitchRow = () => {
    const isDisabled =
      // the preference can be updated if
      // natifications are globally disabled or
      !this.props.isInboxEnabled ||
      // profile is updating
      pot.isUpdating(this.props.profile);

    const isSwitchedOn =
      // inbox is globally disabled or
      this.props.isInboxEnabled &&
      // inbox is disabled for the given service
      this.state.uiEnabledChannels.inbox;

    const onValueChange = (value: boolean) => {
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
    };

    return (
      <Row style={styles.switchRow}>
        <Text
          bold={true}
          style={isSwitchedOn ? styles.enabledColor : styles.disabledColor}
        >
          {this.profileEnabledChannels.inbox
            ? I18n.t("services.serviceIsEnabled")
            : I18n.t("services.serviceNotEnabled")}
        </Text>
        <Switch
          key={`switch-inbox-${this.profileVersion}`}
          value={isSwitchedOn}
          disabled={isDisabled}
          onValueChange={onValueChange}
        />
      </Row>
    );
  };

  private hasChannel = (channel: NotificationChannelEnum) => {
    return fromNullable(this.service.available_notification_channels)
      .map(anc => {
        return anc.indexOf(channel) !== -1;
      })
      .getOrElse(true);
  };

  private getPushSwitchRow = () => {
    if (!this.hasChannel(NotificationChannelEnum.WEBHOOK)) {
      return undefined;
    }
    const isDisabled =
      // The preference can be updated
      // natifications are globally or locally disabled or
      !this.props.isInboxEnabled ||
      !this.state.uiEnabledChannels.inbox ||
      // profile is updating
      pot.isUpdating(this.props.profile);

    const isSwitchedOn =
      // Notifications are not disabled globally nor locally for the given service
      this.props.isInboxEnabled &&
      this.state.uiEnabledChannels.inbox &&
      // and the push notification are enabled for the given service
      this.state.uiEnabledChannels.push;

    const onValueChange = (value: boolean) => {
      // compute the updated map of enabled channels
      const newUiEnabledChannels = {
        ...this.state.uiEnabledChannels,
        push: value
      };
      this.dispatchNewEnabledChannels(newUiEnabledChannels);
    };

    return (
      <Row style={[styles.switchRow, styles.otherSwitchRow]}>
        <Text
          bold={true}
          style={isSwitchedOn ? styles.enabledColor : styles.disabledColor}
        >
          {I18n.t("services.pushNotifications")}
        </Text>
        <Switch
          key={`switch-push-${this.profileVersion}`}
          value={isSwitchedOn}
          disabled={isDisabled}
          onValueChange={onValueChange}
        />
      </Row>
    );
  };

  /**
   * A function to render a list item about the services email forwarding preferences
   * It displays a lock icon if the email notifications are globally enabled/disabled (from preferences)
   */
  private getEmailSwitchRow = () => {
    if (!this.hasChannel(NotificationChannelEnum.EMAIL)) {
      return undefined;
    }
    // determine if the switch interaction should be disabled
    const isDisabled =
      // notifications (all channels) are disabled globally
      !this.props.isInboxEnabled ||
      // the email is not yet validated
      !this.props.isEmailValidated ||
      // the email channel is disabled
      !this.props.isEmailEnabled ||
      // the user wants all services ON or OFF (no custom choices)
      !this.props.isCustomEmailChannelEnabled ||
      // the profile is loading
      pot.isUpdating(this.props.profile);

    const isSwitchedOn =
      // the email notifications are enabled if
      // notifications are enabled globally
      this.props.isInboxEnabled &&
      this.state.uiEnabledChannels.inbox &&
      (!this.props.isCustomEmailChannelEnabled ||
        // if the user has done custom choices check if the current channel is enabled or not
        (this.props.isCustomEmailChannelEnabled &&
          this.state.uiEnabledChannels.email)) &&
      // email is validated
      this.props.isEmailValidated &&
      // the email channel is enabled
      this.props.isEmailEnabled;

    const onValueChange = (value: boolean) => {
      // Compute the updated map of enabled channels
      const newUiEnabledChannels = {
        ...this.state.uiEnabledChannels,
        email: value
      };
      this.dispatchNewEnabledChannels(newUiEnabledChannels);
    };

    return (
      <React.Fragment>
        <Row style={[styles.switchRow, styles.otherSwitchRow]}>
          <View style={styles.flexRow}>
            <Text
              bold={true}
              style={isSwitchedOn ? styles.enabledColor : styles.disabledColor}
            >
              {I18n.t("services.emailForwarding")}
            </Text>
            {!this.props.isEmailEnabled && (
              <IconFont
                style={{ marginLeft: 4 }}
                name={"io-lucchetto"}
                color={customVariables.brandDarkGray}
              />
            )}
          </View>
          <Switch
            key={`switch-email-${this.profileVersion}`}
            disabled={isDisabled}
            value={isSwitchedOn}
            onValueChange={onValueChange}
          />
        </Row>
      </React.Fragment>
    );
  };

  public render() {
    const { service, serviceId } = this;

    const messageForwardingState = this.props.isEmailEnabled
      ? I18n.t("serviceDetail.enabled")
      : I18n.t("serviceDetail.disabled");

    // collect the service metadata
    const potServiceMetadata =
      this.props.content.servicesMetadata.byId[serviceId] || pot.none;

    const emailForwardingDescription = this.props.isEmailValidated
      ? I18n.t("serviceDetail.lockedMailAlert", {
          enabled: messageForwardingState
        })
      : I18n.t("serviceDetail.notValidated");

    const emailForwardingLink = this.props.isEmailValidated
      ? I18n.t("serviceDetail.updatePreferences")
      : I18n.t("serviceDetail.goTo");

    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("serviceDetail.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <Content>
          <Grid>
            {this.getScreenHeader}
            <View spacer={true} large={true} />
            {this.getInboxSwitchRow()}
            {this.getPushSwitchRow()}
            {this.getEmailSwitchRow()}
            {/* TODO: it could be implmented to advise on is_inbox_enabled setting too */}
            {(!this.props.isCustomEmailChannelEnabled ||
              !this.props.isEmailValidated) && (
              <Row style={styles.info}>
                <Text>
                  {emailForwardingDescription}
                  <Text link={true} onPress={this.navigateToEmailPreferences}>
                    {` ${emailForwardingLink}`}
                  </Text>
                </Text>
              </Row>
            )}
          </Grid>

          <View spacer={true} large={true} />
          {this.renderItems(potServiceMetadata)}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) && (
            <H4 style={styles.infoHeader}>
              {I18n.t("services.contactsAndInfo")}
            </H4>
          )}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) &&
            renderInformationRow(
              "C.F.",
              service.organization_fiscal_code,
              service.organization_fiscal_code,
              "COPY"
            )}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) &&
            this.renderContactItems(potServiceMetadata)}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) &&
            this.props.isDebugModeEnabled &&
            renderInformationRow(
              "ID",
              service.service_id,
              service.service_id,
              "COPY"
            )}
          {canRenderItems(this.state.isMarkdownLoaded, potServiceMetadata) && (
            <EdgeBorderComponent />
          )}
          <View spacer={true} extralarge={true} />
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potIsCustomEmailChannelEnabled = isCustomEmailChannelEnabledSelector(
    state
  );
  const isCustomEmailChannelEnabled = pot.getOrElse(
    potIsCustomEmailChannelEnabled,
    false
  );

  return {
    isInboxEnabled: isInboxEnabledSelector(state),
    isEmailEnabled: isEmailEnabledSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    services: servicesSelector(state),
    content: contentSelector(state),
    profile: profileSelector(state),
    isDebugModeEnabled: isDebugModeEnabledSelector(state),
    wasServiceAlertDisplayedOnce: wasServiceAlertDisplayedOnceSelector(state),
    isCustomEmailChannelEnabled
  };
};

export default connect(mapStateToProps)(ServiceDetailsScreen);
