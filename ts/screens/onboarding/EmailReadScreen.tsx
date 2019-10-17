import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { BiometrySimpleType } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
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

export class EmailReadScreen extends React.PureComponent<Props> {
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

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        title={I18n.t("onboarding.email.read.title")}
        contextualHelp={{
          title: I18n.t("onboarding.email.read.title"),
          body: () => (
            <Markdown>{I18n.t("onboarding.email.read.help")}</Markdown>
          )
        }}
      >
        <ScreenContent
          title={I18n.t("onboarding.email.read.title")}
          subtitle={I18n.t("onboarding.email.subtitle")}
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
                accessibilityLabel={I18n.t("onboarding.email.read.title")}
                size={24}
                style={styles.icon}
              />
              <Text style={styles.email}>{profileEmail}</Text>
            </View>
            <View style={styles.spacerLarge} />
            <Text>{I18n.t("onboarding.email.read.emailInfo")}</Text>
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            title: I18n.t("onboarding.email.read.ctaEdit"),
            onPress: this.props.navigateToEmailInsertScreen
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
  optionProfile: pot.toOption(state.profile)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailReadScreen);
