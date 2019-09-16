import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Alert, StyleSheet } from "react-native";
import { connect } from "react-redux";

import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { BiometrySimpleType } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type NavigationParams = {
  biometryType: BiometrySimpleType;
};

type OwnProps = ReduxProps &
  ReturnType<typeof mapStateToProps> &
  NavigationScreenProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  emailLabel: { fontSize: 14 },
  emailWithIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  spacerSmall: { height: 12 },
  spacerLarge: { height: 24 },
  email: {
    fontWeight: customVariables.h1FontWeight,
    color: customVariables.h1Color,
    fontSize: 18,
    marginLeft: 8,
    marginTop: -10 // correct vertical alignment with icon
  }
});

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

/**
 * A screen to show if the fingerprint is supported to the user.
 */
export class FingerprintScreen extends React.PureComponent<Props> {
  private handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: () => this.props.abortOnboarding()
        }
      ]
    );

  public render() {
    const { potProfile } = this.props;

    const profileData = potProfile
      .map(_ => ({
        spid_email: untag(_.spid_email)
      }))
      .getOrElse({
        spid_email: ""
      });

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        title={I18n.t("onboarding.email.title")}
        contextualHelp={{
          title: I18n.t("onboarding.email.title"),
          body: () => <Markdown>{I18n.t("onboarding.email.help")}</Markdown>
        }}
      >
        <ScreenContent
          title={I18n.t("onboarding.email.title")}
          subtitle={I18n.t("onboarding.email.subtitle")}
        >
          <View content={true}>
            <Text style={styles.emailLabel}>
              {I18n.t("onboarding.email.emailInputLabel")}
            </Text>
            <View style={styles.spacerSmall} />
            <View style={styles.emailWithIcon}>
              <IconFont
                name="io-email"
                accessible={true}
                accessibilityLabel={I18n.t("onboarding.email.title")}
                size={36}
              />
              <Text style={styles.email}>{profileData.spid_email}</Text>
            </View>
            <View style={styles.spacerLarge} />
            <Text>{I18n.t("onboarding.email.emailInfo")}</Text>
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            title: I18n.t("onboarding.email.ctaEdit"),
            onPress: unavailableAlert
          }}
          rightButton={{
            block: true,
            primary: true,
            title: I18n.t("global.buttons.continue"),
            onPress: this.props.acknowledgeEmail
          }}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  potProfile: pot.toOption(state.profile)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FingerprintScreen);
