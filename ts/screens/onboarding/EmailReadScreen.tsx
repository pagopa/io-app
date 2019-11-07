/**
 * A screen to display the email used by IO
 * The _isFromProfileSection_ navigation parameter let the screen being adapted
 * if:
 * - it is displayed during the user onboarding
 * - it is displayed after the onboarding (navigation from the profile section)
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
import {
  navigateBack,
  navigateToEmailInsertScreen
} from "../../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type NavigationParams = {
  isFromProfileSection?: boolean;
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

const contextualHelp = {
  title: I18n.t("email.read.title"),
  body: () => <Markdown>{I18n.t("email.read.help")}</Markdown>
};

export class EmailReadScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  get isFromProfileSection() {
    return this.props.navigation.getParam("isFromProfileSection") || false;
  }

  private handleGoBack() {
    if (this.isFromProfileSection) {
      this.props.navigateBack();
    } else {
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
            onPress: this.props.abortOnboarding
          }
        ]
      );
    }
  }

  public render() {
    const { isFromProfileSection } = this;
    const { optionProfile } = this.props;

    const profileEmail = optionProfile
      .map(_ => untag(_.spid_email))
      .getOrElse("");

    const footerProps1: SingleButton = {
      type: "SingleButton",
      leftButton: {
        bordered: true,
        title: I18n.t("email.edit.cta"),
        onPress: () =>
          this.props.navigateToEmailInsertScreen(isFromProfileSection)
      }
    };

    const footerProps2: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        block: true,
        bordered: true,
        title: I18n.t("email.edit.cta"),
        onPress: () =>
          this.props.navigateToEmailInsertScreen(isFromProfileSection)
      },
      rightButton: {
        block: true,
        primary: true,
        title: I18n.t("global.buttons.continue"),
        onPress: this.props.acknowledgeEmail
      }
    };

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        title={I18n.t("profile.preferences.list.email")}
        contextualHelp={contextualHelp}
      >
        <ScreenContent
          title={I18n.t("email.read.title")}
          subtitle={
            isFromProfileSection ? undefined : I18n.t("email.insert.subtitle")
          }
        >
          <View style={styles.content}>
            <Text style={styles.emailLabel}>
              {I18n.t("email.insert.label")}
            </Text>
            <View style={styles.spacerSmall} />
            <View style={styles.emailWithIcon}>
              <IconFont
                name="io-envelope"
                accessible={true}
                accessibilityLabel={I18n.t("email.read.title")}
                size={24}
                style={styles.icon}
              />
              <Text style={styles.email}>{profileEmail}</Text>
            </View>
            <View style={styles.spacerLarge} />
            <Text>
              {isFromProfileSection
                ? `${I18n.t("email.read.details")} \n`
                : I18n.t("email.read.info")}
              <Text bold={true}>
                {isFromProfileSection && I18n.t("email.read.alert")}
              </Text>
            </Text>
          </View>
        </ScreenContent>
        <FooterWithButtons
          {...(isFromProfileSection ? footerProps1 : footerProps2)}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  optionProfile: pot.toOption(profileSelector(state))
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  navigateToEmailInsertScreen: (isFromProfileSection: boolean) => {
    dispatch(navigateToEmailInsertScreen({ isFromProfileSection }));
  },
  navigateBack: () => {
    dispatch(navigateBack());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailReadScreen);
