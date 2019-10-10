/**
 * A screen to display the email used by IO
 */
import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons, {
  SingleButton,
  TwoButtonsInlineHalf
} from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
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
  isController: boolean;
};

type Props = ReduxProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationScreenProps<NavigationParams>;

const styles = StyleSheet.create({
  emailLabel: { fontSize: 14 },
  emailWithIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  content: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  },
  spacerSmall: { height: 12 },
  spacerLarge: { height: 24 },
  email: {
    fontWeight: customVariables.h1FontWeight,
    color: customVariables.h1Color,
    fontSize: 18,
    marginLeft: 8
  },
  icon: {
    marginTop: Platform.OS === "android" ? 3 : 0 // correct icon position to align it with baseline of email text}
  }
});

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

export class EmailScreen extends React.PureComponent<Props> {
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
    const { optionProfile } = this.props;

    const profileEmail = optionProfile
      .map(_ => untag(_.spid_email))
      .getOrElse("");

    const footerProps1: SingleButton = {
      type: "SingleButton",
      leftButton: {
        bordered: true,
        onPress: () => {
          /* TODO */
        },
        title: "Modifica indirizzo email"
      }
    };

    const footerProps2: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        block: true,
        bordered: true,
        title: I18n.t("onboarding.email.ctaEdit"),
        onPress: unavailableAlert
      },
      rightButton: {
        block: true,
        primary: true,
        title: I18n.t("global.buttons.continue"),
        onPress: this.props.acknowledgeEmail
      }
    };

    const isController = this.props.navigation.getParam("isController");

    return (
      <TopScreenComponent
        goBack={isController ? this.props.navigation.goBack : this.handleGoBack}
        title={I18n.t("onboarding.email.title")}
        contextualHelp={{
          title: I18n.t("onboarding.email.title"),
          body: () => <Markdown>{I18n.t("onboarding.email.help")}</Markdown>
        }}
      >
        <ScreenContent
          title={I18n.t("onboarding.email.title")}
          subtitle={
            isController ? undefined : I18n.t("onboarding.email.subtitle")
          }
        >
          <View style={styles.content}>
            <Text style={styles.emailLabel}>
              {I18n.t("onboarding.email.emailInputLabel")}
            </Text>
            <View style={styles.spacerSmall} />
            <View style={styles.emailWithIcon}>
              <IconFont
                name="io-envelope"
                accessible={true}
                accessibilityLabel={I18n.t("onboarding.email.title")}
                size={24}
                style={styles.icon}
              />
              <Text style={styles.email}>{profileEmail}</Text>
            </View>
            <View style={styles.spacerLarge} />
            <Text>
              {isController
                ? `${I18n.t("onboarding.email.emailInfo2")} \n`
                : I18n.t("onboarding.email.emailInfo")}
              <Text bold={true}>
                {isController && I18n.t("onboarding.email.emailAlert")}
              </Text>
            </Text>
          </View>
        </ScreenContent>
        <FooterWithButtons {...(isController ? footerProps1 : footerProps2)} />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  optionProfile: pot.toOption(state.profile)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailScreen);
