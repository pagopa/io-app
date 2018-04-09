// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import { StyleSheet, Image } from 'react-native'
import {
  Container,
  Header,
  Body,
  Content,
  Text,
  View,
  Button,
  H1,
  Left,
  Icon
} from 'native-base'

import { type ReduxProps } from '../../actions/types'
import { type IdentityProvider } from '../../utils/api'
import config from '../../config'
import I18n from '../../i18n'
import IdpsGrid from '../../components/IdpsGrid'
import { selectIdp } from '../../store/actions/session'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

const idps: $ReadOnlyArray<IdentityProvider> = [
  {
    id: 'infocertid',
    name: 'Infocert',
    logo: require('../../../img/spid-idp-infocertid.png'),
    entityID: 'https://identity.infocert.it',
    profileUrl: 'https://my.infocert.it/selfcare'
  },
  {
    id: 'posteid',
    name: 'Poste Italiane',
    logo: require('../../../img/spid-idp-posteid.png'),
    entityID: 'https://posteid.poste.it',
    profileUrl: 'https://posteid.poste.it/private/cruscotto.shtml'
  },
  {
    id: 'sielteid',
    name: 'Sielte',
    logo: require('../../../img/spid-idp-sielteid.png'),
    entityID: 'https://identity.sieltecloud.it',
    profileUrl: 'https://myid.sieltecloud.it/profile/'
  },
  {
    id: 'timid',
    name: 'Telecom Italia',
    logo: require('../../../img/spid-idp-timid.png'),
    entityID: 'https://login.id.tim.it/affwebservices/public/saml2sso',
    profileUrl: 'https://id.tim.it/identity/private/'
  },
  {
    id: 'arubaid',
    name: 'Aruba.it',
    logo: require('../../../img/spid-idp-arubaid.png'),
    entityID: 'https://loginspid.aruba.it',
    profileUrl: 'http://selfcarespid.aruba.it'
  }
]

const testIdp = {
  id: 'test',
  name: 'Test',
  logo: require('../../../img/spid.png'),
  entityID: 'spid-testenv-identityserver',
  profileUrl: 'https://italia-backend/profile.html'
}

const enabledIdps = config.enableTestIdp ? [...idps, testIdp] : idps

const styles = StyleSheet.create({
  spidLogo: {
    width: 80,
    height: 30
  },
  subheader: {
    backgroundColor: '#FFFFFF',
    padding: 24
  }
})

/**
 * A screen where the user choose the SPID IPD to login with.
 */
class IdpSelectionScreen extends React.Component<Props> {
  render(): React.Node {
    return (
      <Container>
        <Header iosBarStyle="dark-content">
          <Left>
            <Button
              transparent
              onPress={(): boolean => this.props.navigation.goBack()}
            >
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t('authentication.idp_selection.headerTitle')}</Text>
          </Body>
        </Header>
        <View style={styles.subheader}>
          <Image
            source={require('../../../img/spid.png')}
            style={styles.spidLogo}
          />
          <View spacer />
          <H1>{I18n.t('authentication.idp_selection.contentTitle')}</H1>
        </View>
        <Content alternative>
          <IdpsGrid
            idps={enabledIdps}
            onIdpSelected={(idp: IdentityProvider) => {
              this.props.dispatch(selectIdp(idp))
            }}
          />
          <View spacer />
          <Button
            block
            light
            bordered
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t('authentication.idp_selection.cancel')}</Text>
          </Button>
        </Content>
        <View footer>
          <Button block transparent>
            <Text>{I18n.t('authentication.landing.nospid')}</Text>
          </Button>
        </View>
      </Container>
    )
  }
}

export default connect()(IdpSelectionScreen)
