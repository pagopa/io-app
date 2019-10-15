import { List } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";

import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReduxProps;

type State = {
  isEmailEnabled?: boolean;
};

const INITIAL_STATE: State = {};

/**
 * Implements the preferences screen related to email forwarding.
 */
class EmailForwardingScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  // tslint:disable:bool-param-default
  private onOptionSelected(isEmailEnabled: boolean | undefined) {
    return () => this.setState({ isEmailEnabled });
  }

  public render() {
    const { potProfile } = this.props;

    const profileData = potProfile
      .map(_ => ({
        spid_email: untag(_.spid_email)
      }))
      .getOrElse({
        spid_email: I18n.t("global.remoteStates.notAvailable")
      });

    return (
      <TopScreenComponent
        title={I18n.t("send_email_messages.title")}
        goBack={() => this.props.navigation.goBack()}
      >
        <ScreenContent
          title={I18n.t("send_email_messages.title")}
          subtitle={I18n.t("send_email_messages.subtitle", {
            email: profileData.spid_email
          })}
        >
          <List withContentLateralPadding={true}>
            <ListItemComponent
              title={I18n.t("send_email_messages.options.disable_all.label")}
              subTitle={I18n.t("send_email_messages.options.disable_all.info")}
              iconName={
                this.state.isEmailEnabled === true
                  ? "io-radio-on"
                  : "io-radio-off"
              }
              useExtendedSubTitle={true}
              onPress={this.onOptionSelected(false)}
            />

            <ListItemComponent
              title={I18n.t("send_email_messages.options.enable_all.label")}
              subTitle={I18n.t("send_email_messages.options.enable_all.info")}
              onPress={this.onOptionSelected(true)}
              iconName={
                this.state.isEmailEnabled === false
                  ? "io-radio-on"
                  : "io-radio-off"
              }
              useExtendedSubTitle={true}
            />

            <ListItemComponent
              title={I18n.t("send_email_messages.options.by_service.label")}
              subTitle={I18n.t("send_email_messages.options.by_service.info")}
              iconName={
                this.state.isEmailEnabled === undefined
                  ? "io-radio-on"
                  : "io-radio-off"
              }
              useExtendedSubTitle={true}
              onPress={this.onOptionSelected(undefined)}
            />

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  potProfile: pot.toOption(state.profile)
});

export default connect(mapStateToProps)(EmailForwardingScreen);
