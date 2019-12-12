import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";

import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = ReduxProps & ReturnType<typeof mapStateToProps>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  spacerLarge: { height: 40 },
  content: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  }
});

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

/**
 * A screen as reminder to the user to validate his email address
 */
export class EmailValidateScreen extends React.PureComponent<Props> {
  private contextualHelp = {
    title: I18n.t("email.validate.title"),
    body: () => <Markdown>{I18n.t("email.validate.help")}</Markdown>
  };

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
        headerTitle={I18n.t("email.validate.header")}
        title={I18n.t("email.validate.title")}
        contextualHelp={this.contextualHelp}
      >
        <ScreenContent title={I18n.t("email.validate.title")}>
          <View style={styles.content}>
            <Markdown>
              {I18n.t("email.validate.info", {
                email: profileEmail
              })}
            </Markdown>
            <View style={styles.spacerLarge} />
            <View>
              <ButtonDefaultOpacity
                light={true}
                block={true}
                bordered={true}
                onPress={unavailableAlert}
              >
                <Text>{I18n.t("email.validate.cta")}</Text>
              </ButtonDefaultOpacity>
            </View>
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            title: I18n.t("email.edit.cta"),
            onPress: this.props.navigateToEmailInsertScreen,
            buttonFontSize: 15
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
  optionProfile: pot.toOption(profileSelector(state))
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  navigateToEmailInsertScreen: () =>
    dispatch(navigateToEmailInsertScreen({ isFromProfileSection: false }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailValidateScreen);
