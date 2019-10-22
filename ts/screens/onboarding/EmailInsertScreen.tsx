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
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { abortOnboarding, emailInsert } from "../../store/actions/onboarding";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type NavigationParams = {
  isEditing?: boolean;
};

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationScreenProps<NavigationParams>;

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
  },
  darkestGray: {
    color: customVariables.brandDarkestGray
  }
});

const EMPTY_EMAIL = "";

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
   *
   * TODO1: add navigation to the dedicated modal
   *          https://www.pivotaltracker.com/story/show/168247501
   * TODO:2 save the inserted new email
   *          https://www.pivotaltracker.com/n/projects/2048617/stories/169264055
   */
  private renderFooterButtons() {
    const continueButtonProps = {
      disabled: this.isValidEmail() !== true,
      onPress: this.isEditing
        ? () => {
            // TODO1
            // TODO2
            Alert.alert("Not implemented");
          }
        : this.props.dispatchEmailInsert,
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
        if (EMPTY_EMAIL === value) {
          return undefined;
        }
        return EmailString.decode(value).isRight();
      })
      .toUndefined();
  }

  private updateEmailState(value: string) {
    this.setState({
      email: value !== EMPTY_EMAIL ? some(value) : none
    });
  }

  private isEditing = this.props.navigation.getParam("isEditing") || false;

  public componentDidMount() {
    if (this.isEditing) {
      this.setState({ email: some(EMPTY_EMAIL) });
    }
  }

  public render() {
    const { isEditing } = this;
    return (
      <BaseScreenComponent
        goBack={() =>
          isEditing ? this.props.navigation.goBack() : this.handleGoBack()
        }
        headerTitle={
          isEditing
            ? I18n.t("profile.preferences.list.email")
            : I18n.t("email.insert.header")
        }
        contextualHelp={{
          title: I18n.t("email.insert.help.title"),
          body: () => <Markdown>{I18n.t("email.insert.help.content")}</Markdown>
        }}
      >
        <View style={styles.container}>
          <Content noPadded={true} style={styles.content} scrollEnabled={false}>
            <H4 style={[styles.boldH4, styles.horizontalPadding]}>
              {isEditing
                ? I18n.t("email.edit.title")
                : I18n.t("email.insert.title")}
            </H4>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Text>
                {isEditing
                  ? this.props.isEmailValidated
                    ? I18n.t("email.edit.validated")
                    : I18n.t("email.edit.subtitle")
                  : I18n.t("email.insert.subtitle")}
                <Text style={styles.darkestGray}>
                  {isEditing ? ` ${this.props.email.getOrElse("")}` : ""}
                </Text>
              </Text>
            </View>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Form>
                <LabelledItem
                  type={"text"}
                  label={
                    isEditing
                      ? I18n.t("email.edit.label")
                      : I18n.t("email.insert.label")
                  }
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
  const optionProfile = pot.toOption(profileSelector(state));
  // TODO: get info on validation from profile
  //      https://www.pivotaltracker.com/story/show/168662501
  const isEmailValidated = true;
  return {
    email: optionProfile.map(_ => untag(_.spid_email)),
    isEmailValidated
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchEmailInsert: () => dispatch(emailInsert())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailInsertScreen);
