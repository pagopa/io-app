import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Icon,
  Left,
  Text,
  View
} from 'native-base'
import * as React from 'react'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { connect } from 'react-redux'
import { isValid } from 'redux-form'
import SpidInformationForm, {
  FORM_NAME as SPID_INFORMATION_FORM_NAME
} from '../../components/forms/SpidInformationForm'
import AppHeader from '../../components/ui/AppHeader'
import Modal from '../../components/ui/Modal'
import I18n from '../../i18n'
import ROUTES from '../../navigation/routes'
import { GlobalState } from '../../reducers/types'

type ReduxMappedProps = {
  isFormValid: boolean
}
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}
type Props = ReduxMappedProps & OwnProps
type State = {
  isTosModalVisible: boolean
}

/**
 * A screen where the user can insert an email to receive information about SPID.
 */
class SpidInformationRequestScreen extends React.Component<Props, State>
{
  public state: State = {
    isTosModalVisible: false
  };

  private goBack() {
    this.props.navigation.goBack();
  }

  private showModal() {
    this.setState({ isTosModalVisible: true });
  }

  private hideModal() {
    this.setState({ isTosModalVisible: false });
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
          <Text>
            {I18n.t('authentication.spid_information_request.headerTitle')}
          </Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>
            {I18n.t('authentication.spid_information_request.contentTitle')}
          </H1>
          <Text>
            {I18n.t('authentication.spid_information_request.paragraph1')}
          </Text>
          <Text link={true}>
            {I18n.t("authentication.spid_information_request.moreLinkText")}
          </Text>
          <View spacer={true} large={true} />
          <Text>
            {I18n.t('authentication.spid_information_request.paragraph2')}
          </Text>
          <View spacer={true} />
          <SpidInformationForm />
          <View spacer={true} />
          <Text>
            {I18n.t('authentication.spid_information_request.paragraph3')}
          </Text>
          <Text link={true} onPress={_ => this.showModal()}>
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
              {I18n.t('authentication.spid_information_request.continue')}
            </Text>
          </Button>
        </View>
        <Modal isVisible={this.state.isTosModalVisible} fullscreen={true}>
          <View header={true}>
            <Icon name="cross" onPress={_ => this.hideModal()} />
          </View>
          <Content>
            <H1>{I18n.t("personal_data_processing.title")}</H1>
            <View spacer={true} large={true} />
            <Text>{I18n.t("personal_data_processing.content")}</Text>
          </Content>
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  /**
   * Our form submit button is outside the `Form` itself so we need to use
   * this selector to check if the form is valid or not.
   */
  isFormValid: isValid(SPID_INFORMATION_FORM_NAME)(state)
})
export default connect(mapStateToProps)(SpidInformationRequestScreen)
