/**
 * A screens to express the preferences related to email forwarding.
 * //TODO: magage errors (check toast etc.) + avoid useless updates
 */
import * as pot from "italia-ts-commons/lib/pot";
import { List, Text } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { customEmailChannelSetEnabled } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import { ReduxProps } from "../../store/actions/types";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { isCustomEmailChannelEnabledSelector } from "../../store/reducers/persistedPreferences";
import {
  isEmailEnabledSelector,
  profileEmailSelector,
  profileSelector,
  ProfileState
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { getProfileChannelsforServicesList } from "../../utils/profile";
import { showToast } from "../../utils/showToast";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps;

function renderListItem(
  title: string,
  subTitle: string,
  isActive: boolean,
  onPress: () => void
) {
  return (
    <ListItemComponent
      title={title}
      subTitle={subTitle}
      iconName={isActive ? "io-radio-on" : "io-radio-off"}
      smallIconSize={true}
      iconOnTop={true}
      useExtendedSubTitle={true}
      onPress={onPress}
    />
  );
}

class EmailForwardingScreen extends React.Component<Props> {
  public componentDidUpdate(prevProps: Props) {
    if (
      pot.isUpdating(prevProps.potProfile) &&
      pot.isError(this.props.potProfile)
    ) {
      showToast(I18n.t("global.genericError"));
    }
  }

  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("send_email_messages.title")}
        goBack={this.props.navigation.goBack}
      >
        <ScreenContent title={I18n.t("send_email_messages.title")}>
          <Text style={{ paddingHorizontal: customVariables.contentPadding }}>
            {I18n.t("send_email_messages.subtitle")}
            <Text bold={true}>{` ${this.props.userEmail}`}</Text>
            <Text>{I18n.t("global.symbols.question")}</Text>
          </Text>
          <List withContentLateralPadding={true}>
            {renderListItem(
              I18n.t("send_email_messages.options.disable_all.label"),
              I18n.t("send_email_messages.options.disable_all.info"),
              !this.props.isEmailEnabled,
              () => {
                // Disable custom email notification and disable email notifications from all visible service
                // The upsert of blocked_inbox_or_channels is avoided: the backend will block any email notification
                // when is_email_enabled is false
                this.props.setCustomEmailChannel(false);
              }
            )}

            {renderListItem(
              I18n.t("send_email_messages.options.enable_all.label"),
              I18n.t("send_email_messages.options.enable_all.info"),
              this.props.isEmailEnabled &&
                !this.props.isCustomEmailChannelEnabled,
              () => {
                // Disable custom email notification and enable email notifications from all visible services.
                // The upsert of blocked_inbox_or_channels is required to enable those channel that was disabled
                // from the service detail
                this.props.disableOrEnableAllEmailNotifications(
                  this.props.visibleServicesId,
                  this.props.potProfile,
                  true
                );
              }
            )}

            {renderListItem(
              I18n.t("send_email_messages.options.by_service.label"),
              I18n.t("send_email_messages.options.by_service.info"),
              this.props.isEmailEnabled &&
                this.props.isCustomEmailChannelEnabled,
              // Enable custom set of the email notification for each visible service
              () => this.props.setCustomEmailChannel(true)
            )}

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potVisibleServices: VisibleServicesState = visibleServicesSelector(
    state
  );
  const visibleServicesId = pot.getOrElse(
    pot.map(potVisibleServices, services =>
      services.map(service => service.service_id)
    ),
    []
  );

  const potProfile = profileSelector(state);
  const potIsCustomEmailChannelEnabled = isCustomEmailChannelEnabledSelector(
    state
  );
  const isCustomEmailChannelEnabled = potIsCustomEmailChannelEnabled.fold(
    false,
    (b: boolean) => b
  );

  const potUserEmail = profileEmailSelector(state);
  const userEmail = potUserEmail.fold(
    I18n.t("global.remoteStates.notAvailable"),
    (i: string) => i
  );

  return {
    potProfile,
    isLoading: pot.isLoading(potProfile) || pot.isUpdating(potProfile),
    isEmailEnabled: isEmailEnabledSelector(state),
    isCustomEmailChannelEnabled,
    visibleServicesId,
    userEmail
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: add managment of errors
  disableOrEnableAllEmailNotifications: (
    servicesId: ReadonlyArray<string>,
    profile: ProfileState,
    enable: boolean
  ) => {
    const newBlockedChannels = getProfileChannelsforServicesList(
      servicesId,
      profile,
      enable,
      "EMAIL"
    );
    dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedChannels,
        is_email_enabled: enable
      })
    );
    dispatch(customEmailChannelSetEnabled(false));
  },
  setCustomEmailChannel: (enable: boolean) => {
    dispatch(customEmailChannelSetEnabled(enable));
    dispatch(
      profileUpsert.request({
        is_email_enabled: enable
      })
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(EmailForwardingScreen));
