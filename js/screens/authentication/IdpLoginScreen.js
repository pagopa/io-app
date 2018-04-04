// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import { WebView } from 'react-native'
import { Container, Header, Left, Button, Icon, Text, Body } from 'native-base'

import { type ReduxProps } from '../../actions/types'
import { type GlobalState } from '../../reducers/types'
import { type SessionState } from '../../store/reducers/session'
import config from '../../config'
import I18n from '../../i18n'
import { extractLoginResult } from '../../api'
import { loginSuccess, loginFailure } from '../../store/actions/session'

type ReduxMappedProps = {
  session: SessionState
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

const LOGIN_BASE_URL = `${config.apiUrlPrefix}/login?entityID=`

/**
 * A screen that allow the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
class IdpLoginScreen extends React.Component<Props> {
  render(): React.Node {
    const { session } = this.props
    if (!session.idp) {
      return null
    }

    const loginUri = LOGIN_BASE_URL + session.idp.entityID
    return (
      <Container>
        <Header>
          <Left>
            <Button
              transparent
              onPress={(): boolean => this.props.navigation.goBack()}
            >
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t('authentication.idp_login.headerTitle')}</Text>
          </Body>
        </Header>
        <WebView
          source={{ uri: loginUri }}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </Container>
    )
  }

  onNavigationStateChange = navState => {
    const url = navState.url

    // Extract the login result from the url.
    // If the url is not related to login this will be `null`
    const loginResult = extractLoginResult(url)

    if (loginResult) {
      if (loginResult.success) {
        // In case of successful login
        this.props.dispatch(loginSuccess(loginResult.token))
      } else {
        // In case of login failure
        this.props.dispatch(loginFailure())
      }
    }
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  session: state.session
})

export default connect(mapStateToProps)(IdpLoginScreen)
