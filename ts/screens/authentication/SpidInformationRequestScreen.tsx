import { Button, Content, H1, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { isValid } from "redux-form";
import SpidInformationForm, {
  FORM_NAME as SPID_INFORMATION_FORM_NAME
} from "../../components/forms/SpidInformationForm";
import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../../components/helpers/withContextualHelp";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";

type ReduxMappedProps = {
  isFormValid: boolean;
};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps & OwnProps & ContextualHelpInjectedProps;

/**
 * A screen where the user can insert an email to receive information about SPID.
 */
class SpidInformationRequestScreen extends React.PureComponent<Props> {
  private goBack = () => this.props.navigation.goBack();

  public render() {
    return (
      <BaseScreenComponent
        goBack={this.goBack}
        headerTitle={I18n.t(
          "authentication.spid_information_request.headerTitle"
        )}
      >
        <Content>
          <H1>
            {I18n.t("authentication.spid_information_request.contentTitle")}
          </H1>
          <Text>
            {I18n.t("authentication.spid_information_request.paragraph1")}
          </Text>
          <Text link={true}>
            {I18n.t("authentication.spid_information_request.moreLinkText")}
          </Text>
          <View spacer={true} large={true} />
          <Text>
            {I18n.t("authentication.spid_information_request.paragraph2")}
          </Text>
          <View spacer={true} />
          <SpidInformationForm />
          <View spacer={true} />
          <Text>
            {I18n.t("authentication.spid_information_request.paragraph3")}
          </Text>
          <Text link={true} onPress={this.props.showHelp}>
            {I18n.t("authentication.spid_information_request.tosLinkText")}
          </Text>
          <View spacer={true} extralarge={true} />
          <View spacer={true} extralarge={true} />
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            disabled={!this.props.isFormValid}
          >
            <Text>
              {I18n.t("authentication.spid_information_request.continue")}
            </Text>
          </Button>
        </View>
      </BaseScreenComponent>
    );
  }
}

const isFormValidSelector = isValid(SPID_INFORMATION_FORM_NAME);

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  /**
   * Our form submit button is outside the `Form` itself so we need to use
   * this selector to check if the form is valid or not.
   */
  isFormValid: isFormValidSelector(state)
});

export default connect(mapStateToProps)(
  withContextualHelp(
    SpidInformationRequestScreen,
    I18n.t("profile.main.privacy.title"),
    () => <Markdown>{I18n.t("profile.main.privacy.text")}</Markdown>
  )
);
