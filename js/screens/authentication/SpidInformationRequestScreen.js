// @flow

import * as React from 'react'
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
  Left,
  Body
} from 'native-base'

import I18n from '../../i18n'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & OwnProps

/**
 * A screen where the user can insert an email to receive information about SPID.
 */
class SpidInformationRequestScreen extends React.Component<Props> {
  render(): React.Node {
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
            <Text>
              {I18n.t('authentication.spid_information_request.headerTitle')}
            </Text>
          </Body>
        </Header>
        <Content />
        <View footer>
          <Button block primary>
            <Text>
              {I18n.t('authentication.spid_information_request.continue')}
            </Text>
          </Button>
        </View>
      </Container>
    )
  }
}

export default SpidInformationRequestScreen
