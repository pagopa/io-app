/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { EmailString } from "italia-ts-commons/lib/strings";
import { untag } from "italia-ts-commons/lib/types";

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
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps &
  OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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
  },
  icon: {
    marginTop: Platform.OS === "android" ? 4 : 6 // correct icon position to align it with baseline of email text}
  },
  emailInput: {
    fontWeight: customVariables.h1FontWeight,
    color: customVariables.h1Color,
    fontSize: 18
  }
});

const EMPTY_EMAIL = "";

const contextualHelp = {
  title: I18n.t("onboarding.email.insert.help.title"),
  body: () => (
    <Markdown>{I18n.t("onboarding.email.insert.help.content")}</Markdown>
  )
};

type State = Readonly<{
  email: Option<string>;
}>;

/**
 * A screen to allow user to insert an email address.
 */
class EmailInsertScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { email: this.props.email };
  }

  /**
   * Footer
   */
  private renderFooterButtons() {
    const continueButtonProps = {
      disabled: this.isValidEmail() !== true,
      onPress: this.props.dispatchEmailInsert,
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: this.isValidEmail()
    };

    return (
      <FooterWithButtons type="SingleButton" leftButton={continueButtonProps} />
    );
  }

  /** validate email returning three possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   * - _undefined_, if email field is empty. This state is consumed by
   * LabelledItem Component and it used for style pourposes ONLY.
   */
  private isValidEmail() {
    return this.state.email
      .map(value => {
        return EmailString.decode(value).isRight();
      })
      .toUndefined();
  }

  private updateEmailState(value: string) {
    this.setState({
      email: value !== EMPTY_EMAIL ? some(value) : none
    });
  }

  public render() {
    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.email.insert.headerTitle")}
        contextualHelp={contextualHelp}
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
                  icon="io-envelope"
                  isValid={this.isValidEmail()}
                  inputProps={{
                    autoCapitalize: "none",
                    value: this.state.email.getOrElse(EMPTY_EMAIL),
                    onChangeText: (value: string) =>
                      this.updateEmailState(value),
                    style: styles.emailInput
                  }}
                  iconStyle={styles.icon}
                />
              </Form>
            </View>
          </Content>

          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.select({
              ios: 100,
              android: 80
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
  const optionProfile = pot.toOption(state.profile);

  return {
    email: optionProfile.map(_ => untag(_.spid_email))
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchEmailInsert: () => dispatch(emailInsert())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailInsertScreen);
