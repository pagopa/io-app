import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Text,
  View
} from "native-base";
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
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
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
class SpidInformationRequestScreen extends React.Component<Props> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>
              {I18n.t("authentication.spid_information_request.headerTitle")}
            </Text>
          </Body>
        </AppHeader>
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
      </Container>
    );
  }
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  /**
   * Our form submit button is outside the `Form` itself so we need to use
   * this selector to check if the form is valid or not.
   */
  isFormValid: isValid(SPID_INFORMATION_FORM_NAME)(state)
});

export default connect(mapStateToProps)(
  withContextualHelp(
    SpidInformationRequestScreen,
    I18n.t("personal_data_processing.title"),
    I18n.t("personal_data_processing.content")
  )
);
