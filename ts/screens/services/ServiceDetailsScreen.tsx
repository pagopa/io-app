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
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import { MultiImage } from "../../components/ui/MultiImage";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import { serviceAlertDisplayedOnceSuccess } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import {
  ServiceMetadataState,
  servicesMetadataByIdSelector
} from "../../store/reducers/content";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { servicesSelector } from "../../store/reducers/entities/services";
import { wasServiceAlertDisplayedOnceSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector } from "../../store/reducers/profile";
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

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReduxProps &
  NavigationInjectedProps<NavigationParams>;

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
  imageHeight: {
    height: 60
  },
  imageWidth: {
    width: 60
  }
});

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
      <Button
        primary={true}
        small={true}
        onPress={() => handleItemOnPress(value, valueType)}
      >
        <Text uppercase={false} ellipsizeMode={"tail"} numberOfLines={1}>
          {info}
        </Text>
      </Button>
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
      <TouchableOpacity onPress={() => handleItemOnPress(value, valueType)}>
        <Text link={true} ellipsizeMode={"tail"} numberOfLines={1}>
          {info}
        </Text>
      </TouchableOpacity>
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
      <TouchableOpacity onPress={() => handleItemOnPress(url, "LINK")}>
        <Image
          style={styles.badgeLogo}
          resizeMode={"contain"}
          source={source}
        />
      </TouchableOpacity>
    </View>
  );
}

class ServiceDetailsScreen extends React.Component<Props, State> {
  private serviceId = this.props.navigation.getParam("service").service_id;
  constructor(props: Props) {
    super(props);
    // We initialize the UI by making the states of the channels the same
    // as what is set in the profile. The user will be able to change the state
    // via the UI and the profile will be updated in the background accordingly
    this.state = {
      uiEnabledChannels: getEnabledChannelsForService(
        this.props.profile,
        this.serviceId
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

  private renderItems = (potServiceMetadata: ServiceMetadataState) => {
    if (pot.isSome(potServiceMetadata) && potServiceMetadata.value) {
      const metadata = potServiceMetadata.value;
      return (
        <React.Fragment>
          {metadata.description && (
            <Markdown animated={true}>{metadata.description}</Markdown>
          )}
          {metadata.description && <View spacer={true} large={true} />}
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
          {(metadata.app_android || metadata.app_ios || metadata.web_url) && (
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
        </React.Fragment>
      );
    } else {
      return undefined;
    }
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
    } else {
      return undefined;
    }
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

  // tslint:disable-next-line:cognitive-complexity no-big-function
  public render() {
    // collect the service
    const service = this.props.navigation.getParam("service");
    // finds out which channels are enabled in the user profile
    const profileEnabledChannels = getEnabledChannelsForService(
      this.props.profile,
      this.serviceId
    );

    const potServiceMetadata = this.props.servicesMetadataById[this.serviceId];

    // whether last attempt to save the preferences failed
    const profileVersion = pot
      .toOption(this.props.profile)
      .mapNullable(_ => (_.has_profile ? _.version : null))
      .getOrElse(0 as NonNegativeInteger);

    // URIs for the service logo
    const logoUris = logosForService(service);
    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("serviceDetail.headerTitle")}
      >
        <Content>
          <Grid>
            <Row>
              <Col>
                <H4>{service.organization_name}</H4>
                <H2>{service.service_name}</H2>
              </Col>
              <Col style={styles.imageWidth}>
                <MultiImage
                  style={[styles.imageHeight, styles.imageWidth]}
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
                  {I18n.t("services.emailForwarding")}
                </Text>
              </Col>
              <Col size={2}>
                <Switch
                  key={`switch-email-${profileVersion}`}
                  disabled={
                    !this.state.uiEnabledChannels.inbox ||
                    pot.isUpdating(this.props.profile)
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
                    this.dispatchNewEnabledChannels(newUiEnabledChannels);
                  }}
                />
              </Col>
            </Row>
          </Grid>

          <View spacer={true} large={true} />
          {this.renderItems(potServiceMetadata)}
          <H4 style={styles.infoHeader}>
            {I18n.t("services.contactsAndInfo")}
          </H4>
          {renderInformationRow(
            "C.F.",
            service.organization_fiscal_code,
            service.organization_fiscal_code,
            "COPY"
          )}
          {this.renderContactItems(potServiceMetadata)}
          {this.props.isDebugModeEnabled &&
            renderInformationRow(
              "ID",
              service.service_id,
              service.service_id,
              "COPY"
            )}
          <View spacer={true} extralarge={true} />
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  services: servicesSelector(state),
  servicesMetadataById: servicesMetadataByIdSelector(state),
  profile: profileSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state),
  wasServiceAlertDisplayedOnce: wasServiceAlertDisplayedOnceSelector(state)
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
