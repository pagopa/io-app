// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import {
  Container,
  Content,
  Text,
  View,
  Button,
  Icon,
  Header,
  Body
} from 'native-base'

import { type ReduxProps } from '../../actions/types'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'
import variables from '../../theme/variables'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * A screen where the user can choose to login with SPID or get more informations.
 */
class LandingScreen extends React.Component<Props> {
  render(): React.Node {
    return (
      <Container>
        <Header
          androidStatusBarColor={variables.androidStatusBarColor}
          iosBarStyle="dark-content"
        >
          <Body>
            <Text>{I18n.t('authentication.landing.headerTitle')}</Text>
          </Body>
        </Header>
        <Content />
        <View footer>
          <Button
            block
            primary
            iconLeft
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_IDP_SELECTION
              )
            }
          >
            <Icon name="user" />
            <Text>{I18n.t('authentication.landing.login')}</Text>
          </Button>
          <View spacer />
          <Button
            block
            small
            transparent
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST
              )
            }
          >
            <Text>{I18n.t('authentication.landing.nospid')}</Text>
          </Button>
        </View>
      </Container>
    )
  }
}

export default connect()(LandingScreen)
