import { List, Text } from "native-base";
import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import customVariables from '../../theme/variables';
import { spidEmailSelector, ProfileState, profileSelector } from '../../store/reducers/profile';
import { Dispatch } from 'redux';
import { getProfileChannelsforServicesList } from '../../utils/profile';
import { profileUpsert } from '../../store/actions/profile';
import { visibleServicesSelector, VisibleServicesState } from '../../store/reducers/entities/services/visibleServices';
import { updateEmailNotificationPreferences } from '../../store/actions/persistedPreferences';
import { EmailNotificationPreferences, EmailEnum, emailNotificationPreferencesSelector } from '../../store/reducers/persistedPreferences';

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & 
ReturnType<typeof mapStateToProps> & 
ReturnType<typeof mapDispatchToProps> &
ReduxProps;

function renderListItem (
  title: string,
  subTitle: string,
  isActive: boolean,
  onPress: () => void
){
  //TODO:  manage both reading and saving of preference about notifications
  return(
    <ListItemComponent
              title={title}
              subTitle={subTitle}
              iconName={isActive ? "io-radio-on" : "io-radio-off"}
              smallIconSize={true}
              iconOnTop={true}
              useExtendedSubTitle={true}
              onPress={onPress}
    />
  )
}

/**
 * Implements the preferences screen related to email forwarding.
 */
class EmailForwardingScreen extends React.Component<Props> {
  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("send_email_messages.title")}
        goBack={this.props.navigation.goBack}
      >
        <ScreenContent title={I18n.t("send_email_messages.title")}>
          <Text style={{paddingHorizontal: customVariables.contentPadding}}>
            {I18n.t("send_email_messages.subtitle")}
            <Text bold={true}>{` ${this.props.userEmail}`}</Text>
            <Text>{I18n.t("global.symbols.question")}</Text>  
          </Text>
          <List withContentLateralPadding={true}>
            {renderListItem(
              I18n.t("send_email_messages.options.disable_all.label"),
              I18n.t("send_email_messages.options.disable_all.info"),
              this.props.emailNotificationPreference === EmailEnum.DISABLE_ALL,
              () => {
                // Disable custom email notification
                this.props.setCustomEmailNotification(EmailEnum.DISABLE_ALL);

                this.props.disableOrEnableServices(
                this.props.visibleServices,
                this.props.profile,
                false
              )}
            )}

            {renderListItem(
              I18n.t("send_email_messages.options.enable_all.label"),
              I18n.t("send_email_messages.options.enable_all.info"),
              this.props.emailNotificationPreference === EmailEnum.ENABLE_ALL,
              () => {
                // Disable custom email notification
                this.props.setCustomEmailNotification(EmailEnum.ENABLE_ALL);

                this.props.disableOrEnableServices(
                this.props.visibleServices,
                this.props.profile,
                true
              )}
            )}

            {renderListItem(
              I18n.t("send_email_messages.options.by_service.label"),
              I18n.t("send_email_messages.options.by_service.info"),
              this.props.emailNotificationPreference === EmailEnum.CUSTOM,
              () => this.props.setCustomEmailNotification(EmailEnum.CUSTOM)
            )}

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potVisibleServices: VisibleServicesState =  visibleServicesSelector(state);
  const visibleServices = pot.getOrElse(
    pot.map(potVisibleServices, visibleServices => 
    visibleServices.map(service => service.service_id)
  ), []);
  
  return {
    profile: profileSelector(state),
    visibleServices,
    // TODO: refer to the proper address in the new user profile CREATE STORY
    userEmail: spidEmailSelector(state),
    emailNotificationPreference: emailNotificationPreferencesSelector(state)
}}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  disableOrEnableServices: (
    servicesId: ReadonlyArray<string>,
    profile: ProfileState,
    enable: boolean
  ) => {
    const newBlockedChannels = getProfileChannelsforServicesList(
      servicesId,
      profile,
      enable
    );
    dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedChannels
      })
    );
  },
  setCustomEmailNotification: (preference: EmailNotificationPreferences) => 
    dispatch(updateEmailNotificationPreferences(preference))
});

export default connect(mapStateToProps, mapDispatchToProps)(EmailForwardingScreen);
