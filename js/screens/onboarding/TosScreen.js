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
  Left,
  Body,
  H1,
  H3
} from 'native-base'

import { type ReduxProps } from '../../actions/types'
import I18n from '../../i18n'
import { acceptTos } from '../../store/actions/onboarding'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * A screen to show the ToS to the user.
 */
class TosScreen extends React.Component<Props> {
  acceptTos = () => {
    this.props.dispatch(acceptTos())
  }

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
            <Text>{I18n.t('onboarding.tos.headerTitle')}</Text>
          </Body>
        </Header>
        <Content>
          <H1>{I18n.t('onboarding.tos.contentTitle')}</H1>
          <View spacer extralarge />
          <H3>{I18n.t('onboarding.tos.section1')}</H3>
          <View spacer />
          <Text>{I18n.t('lipsum.medium')}</Text>
          <View spacer extralarge />
          <H3>{I18n.t('onboarding.tos.section2')}</H3>
          <View spacer />
          <Text>{I18n.t('lipsum.medium')}</Text>
        </Content>
        <View footer>
          <Button block primary onPress={this.acceptTos}>
            <Text>{I18n.t('onboarding.tos.continue')}</Text>
          </Button>
        </View>
      </Container>
    )
  }
}

export default connect()(TosScreen)
