import {
  Body,
  Button,
  Col,
  Container,
  Content,
  Grid,
  H1,
  H2,
  H3,
  Left,
  Row,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable, Option } from "fp-ts/lib/Option";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import Switch from "../../components/ui/Switch";

import I18n from "../../i18n";

import { BlockedInboxOrChannels } from "../../../definitions/backend/BlockedInboxOrChannels";
import { ProfileWithEmail } from "../../../definitions/backend/ProfileWithEmail";
import { ServiceId } from "../../../definitions/backend/ServiceId";

import { profileUpsertRequest } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import { ContentState } from "../../store/reducers/content";
import { ServicesState } from "../../store/reducers/entities/services";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

export interface IMessageDetailsScreenParam {
  readonly serviceId: ServiceId;
}

interface INavigationStateWithParams extends NavigationState {
  readonly params: IMessageDetailsScreenParam;
}

/**
 * The enabled/disabled state of each channel.
 *
 * Consider generating this map from the API specs.
 */
interface EnabledChannels {
  inbox: boolean;
  email: boolean;
  push: boolean;
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

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";

/**
 * Finds out which channels are enabled in the profile for the provided service
 */
function getEnabledChannelsForService(
  profileState: ProfileState,
  serviceId: ServiceId
): EnabledChannels {
  return fromNullable(profileState)
    .mapNullable(
      profile =>
        ProfileWithEmail.is(profile) ? profile.blocked_inbox_or_channels : null
    )
    .mapNullable(blockedChannels => blockedChannels[serviceId])
    .map(_ => ({
      inbox: _.indexOf(INBOX_CHANNEL) === -1,
      email: _.indexOf(EMAIL_CHANNEL) === -1,
      push: _.indexOf(PUSH_CHANNEL) === -1
    }))
    .getOrElse({
      inbox: true,
      email: true,
      push: true
    });
}

/**
 * Returns a function that generates updated blocked channels from the
 * enabled channels
 */
const getBlockedChannels = (
  profileState: ProfileState,
  serviceId: ServiceId
) => (enabled: EnabledChannels): BlockedInboxOrChannels => {
  // get the current blocked channels from the profile
  const profileBlockedChannels = fromNullable(profileState)
    .mapNullable(
      profile =>
        ProfileWithEmail.is(profile) ? profile.blocked_inbox_or_channels : null
    )
    .getOrElse({});

  // compute the blocked channels array for this service
  const blockedChannelsForService = [
    !enabled.inbox ? INBOX_CHANNEL : "",
    !enabled.push ? PUSH_CHANNEL : "",
    !enabled.email ? EMAIL_CHANNEL : ""
  ].filter(_ => _ !== "");

  // returned the merged current blocked channels with the blocked channels for
  // this service
  return {
    ...profileBlockedChannels,
    [serviceId]: blockedChannelsForService
  };
};

/**
 * Renders a row in the service information panel
 */
function renderInformationRow(label: string, info: string) {
  return (
    <Row>
      <Col size={2}>
        <Button light={true} small={true} transparent={true}>
          <Text>{label}:</Text>
        </Button>
      </Col>
      <Col size={4}>
        <Button primary={true} small={true}>
          <Text>{info}</Text>
        </Button>
      </Col>
    </Row>
  );
}

class ServiceDetailsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // We initialize the UI by making the states of the channels the same
    // as what is set in the profile. The user will be able to change the state
    // via the UI and the profile will be updated in the background accordingly.
    const serviceId = this.props.navigation.state.params.serviceId;
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
          nextProps.navigation.state.params.serviceId
        )
      });
    }
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  /**
   * Dispatches a profileUpsertRequest to trigger an asynchronous update of the
   * profile with the new enabled channels
   */
  private dispatchNewEnabledChannels(newUiEnabledChannels: EnabledChannels) {
    const updatedBlockedChannels = getBlockedChannels(
      this.props.profile,
      this.props.navigation.state.params.serviceId
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

  public render() {
    // collect the service
    const serviceId = this.props.navigation.state.params.serviceId;
    const service = this.props.services.byId[serviceId];

    // finds out which channels are enabled in the user profile
    const profileEnabledChannels = getEnabledChannelsForService(
      this.props.profile,
      serviceId
    );

    // collect the service metadata
    const serviceMetadata = this.props.content.servicesMetadata.byId[serviceId];

    // collect the organization metadata
    const maybeOrganizationMetadata = fromNullable(
      this.props.content.organizationsMetadata.byFiscalCode[
        service.organization_fiscal_code
      ]
    );

    const orgAddress = maybeOrganizationMetadata
      .mapNullable(_ => _.Indirizzo)
      .toNullable();

    // whether last attempt to save the preferences failed
    const profileVersion = fromNullable(this.props.profile)
      .mapNullable(_ => _.version)
      .getOrElse(0 as NonNegativeInteger);

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{service.service_name}</Text>
          </Body>
        </AppHeader>

        <Content>
          <Grid>
            <Row>
              <Col>
                <H3>
                  {service.department_name}, {service.organization_name}
                </H3>
                <H1>{service.service_name}</H1>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Col size={10}>
                <Text>{I18n.t("services.serviceIsEnabled")}</Text>
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
                <Text>{I18n.t("services.pushNotifications")}</Text>
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
                <Text>{I18n.t("services.emailNotifications")}</Text>
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
            {serviceMetadata && (
              <Row>
                <Col>
                  <Markdown>{serviceMetadata.description}</Markdown>
                </Col>
              </Row>
            )}
            {serviceMetadata && <View spacer={true} large={true} />}
            <Row>
              <Col size={6}>
                <H2>{I18n.t("services.contactsAndInfo")}</H2>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {renderInformationRow("C.F.", service.organization_fiscal_code)}
            {orgAddress && <View spacer={true} />}
            {orgAddress && renderInformationRow("Indirizzo", orgAddress)}
          </Grid>
          <View spacer={true} large={true} />
        </Content>
      </Container>
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
