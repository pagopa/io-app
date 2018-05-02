import * as React from 'react'
import { connect } from 'react-redux'
import { isValid } from 'redux-form'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import {
  Container,
  Content,
  Text,
  View,
  Button,
  Icon,
  Left,
  Body,
  H1
} from 'native-base'
import { GlobalState } from '../../reducers/types'
import I18n from '../../i18n'
import AppHeader from '../../components/ui/AppHeader'
import Modal from '../../components/ui/Modal'
import SpidInformationForm, {
  FORM_NAME as SPID_INFORMATION_FORM_NAME
} from '../../components/forms/SpidInformationForm'
import ROUTES from '../../navigation/routes'

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
  state: State = {
    isTosModalVisible: false
  }

  render()
  {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent
              onPress={(): boolean => this.props.navigation.goBack()}
            >
              <Icon name="chevron-left"/>
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
          <Text link>
            {I18n.t('authentication.spid_information_request.moreLinkText')}
          </Text>
          <View spacer large/>
          <Text>
            {I18n.t('authentication.spid_information_request.paragraph2')}
          </Text>
          <View spacer/>
          <SpidInformationForm/>
          <View spacer/>
          <Text>
            {I18n.t('authentication.spid_information_request.paragraph3')}
          </Text>
          <Text
            link
            onPress={(): void => this.setState({ isTosModalVisible: true })}
          >
            {I18n.t('authentication.spid_information_request.tosLinkText')}
          </Text>
        </Content>
        <View footer>
          <Button block primary disabled={!this.props.isFormValid}
                  onPress={(): boolean =>
                    this.props.navigation.navigate(ROUTES.PORTFOLIO_HOME)
                  }>
            <Text>
              {I18n.t('authentication.spid_information_request.continue')}
            </Text>
          </Button>
        </View>
        <Modal isVisible={this.state.isTosModalVisible} fullscreen>
          <View header>
            <Icon
              name="cross"
              onPress={(): void => this.setState({ isTosModalVisible: false })}
            />
          </View>
          <Content>
            <H1>{I18n.t('personal_data_processing.title')}</H1>
            <View spacer large/>
            <Text>{I18n.t('personal_data_processing.content')}</Text>
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
