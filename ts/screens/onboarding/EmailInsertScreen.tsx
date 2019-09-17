/**
 * A screen where user after login (with CIE) can set email address if is not present in the profile.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";

import { Content, Form, Text, View } from "native-base";

import * as React from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { abortOnboarding, emailInsert } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  horizontalPadding: {
    paddingHorizontal: customVariables.contentPadding
  },
  boldH4: {
    fontWeight: customVariables.textBoldWeight,
    paddingTop: customVariables.spacerLargeHeight
  }
});

const EMPTY_EMAIL = "";

const INITIAL_STATE: State = {
  email: none
};

type State = Readonly<{
  email: Option<string>;
}>;

/**
 * A valid Email
 */
export const Email = RegExp(
  '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
);

/**
 * A screen to allow user to insert an email address.
 */
class EmailScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  /**
   * Footer
   */
  private renderFooterButtons() {
    const continueButtonProps = {
      disabled: !this.isFormValid(),
      onPress: () => this.props.dispatch(emailInsert()),
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: this.isFormValid()
    };

    return (
      <FooterWithButtons type="SingleButton" leftButton={continueButtonProps} />
    );
  }

  private isValidEmail() {
    return this.state.email
      .map(value => {
        return Email.test(value);
      })
      .toUndefined();
  }

  private updateEmailState(value: string) {
    this.setState({
      email: value && value !== EMPTY_EMAIL ? some(value) : none
    });
  }

  private isFormValid = () =>
    Email.test(this.state.email.getOrElse(EMPTY_EMAIL));

  public render() {
    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.email.insert.headerTitle")}
        contextualHelp={{
          title: I18n.t("onboarding.email.insert.help.title"),
          body: () => (
            <Markdown>
              {I18n.t("onboarding.email.insert.help.content")}
            </Markdown>
          )
        }}
      >
        <View style={styles.container}>
          <Content noPadded={true} style={styles.content} scrollEnabled={false}>
            <H4 style={[styles.boldH4, styles.horizontalPadding]}>
              {I18n.t("onboarding.email.insert.title")}
            </H4>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Text>{I18n.t("onboarding.email.subtitle")}</Text>
            </View>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Form>
                <LabelledItem
                  type={"text"}
                  label={I18n.t("onboarding.email.emailInputLabel")}
                  icon="io-email"
                  isValid={this.isValidEmail()}
                  inputProps={{
                    autoCapitalize: "none",
                    value: this.state.email.getOrElse(EMPTY_EMAIL),
                    onChangeText: (value: string) =>
                      this.updateEmailState(value)
                  }}
                />
              </Form>
            </View>
          </Content>

          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.select({
              ios: 0,
              android: customVariables.contentPadding
            })}
          >
            {this.renderFooterButtons()}
          </KeyboardAvoidingView>
        </View>
      </BaseScreenComponent>
    );
  }

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
          onPress: () => this.props.dispatch(abortOnboarding())
        }
      ]
    );
}

function mapStateToProps(state: GlobalState) {
  const potProfile = profileSelector(state);

  return {
    email:
      pot.isSome(potProfile) &&
      "spid_email" in potProfile.value &&
      potProfile.value.spid_email
  };
}

export default connect(mapStateToProps)(EmailScreen);
