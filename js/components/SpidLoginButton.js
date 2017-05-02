/**
 * @providesModule SpidLoginButton
 * @flow
 */

'use strict'

const React = require('react')
const ReactNative = require('react-native')
const {
  StyleSheet,
  View,
  WebView,
  Image,
  Modal,
  Alert,
} = ReactNative

import {
  Container,
  Header,
  Body,
  Title,
  Content,
  Button,
  Text,
  Left,
  Right,
  Icon,
} from 'native-base'

export type IdentityProvider = {
  id: string,
  logo: mixed,
  name: string,
  entityID: string,
  profileUrl?: string,
};

// prefix for recognizing auth token
const TOKEN_PATH_PREFIX = '/app/token/get/'

// TODO dynamically build this list
const idps: Array<IdentityProvider> = [
  {
    id: 'infocert',
    name: 'Infocert',
    logo: require('../../img/spid-idp-infocertid.png'),
    entityID: 'https://identity.infocert.it',
    profileUrl: 'https://my.infocert.it/selfcare',
  },
  {
    id: 'poste',
    name: 'Poste Italiane',
    logo: require('../../img/spid-idp-posteid.png'),
    entityID: 'https://posteid.poste.it',
    profileUrl: 'https://posteid.poste.it/private/cruscotto.shtml',
  },
  {
    id: 'sielte',
    name: 'Sielte',
    logo: require('../../img/spid-idp-sielteid.png'),
    entityID: 'https://identity.sieltecloud.it',
    profileUrl: 'https://myid.sieltecloud.it/profile/',
  },
  {
    id: 'tim',
    name: 'Telecom Italia',
    logo: require('../../img/spid-idp-timid.png'),
    entityID: 'https://login.id.tim.it/affwebservices/public/saml2sso',
    profileUrl: 'https://id.tim.it/identity/private/',
  },
  {
    id: 'aruba',
    name: 'Aruba.it',
    logo: require('../../img/spid-idp-arubaid.png'),
    entityID: 'https://loginspid.aruba.it',
    profileUrl: 'http://selfcarespid.aruba.it',
  },
]

const WEBVIEW_REF = 'webview'
const LOGIN_BASE_URL = 'https://spid-test.spc-app1.teamdigitale.it/saml/Login?target=/app/token/new&entityID='

/**
 * Restituisce le proprietà dell'IdP associato all'identificativo
 * idpId. Restituisce undefined in caso non esista nessun IdP
 * con quell'identificativo.
 * @param {string} idpId - L'identificativo dell'IdP
 */
export function getIdpInfo(idpId: string): ?IdentityProvider {
  return idps.find((idp) => idp.id === idpId)
}

/**
 * Webview usata per la pagina di login dell'IdP
 *
 * TODO aggiungere animazione di loading
 */
class SpidLoginWebview extends React.Component {

  props: {
    idp: IdentityProvider,
    onSuccess: (token: string) => void,
    onError: (err: string) => void,
  };

  state: {
    url: string,
    status: string,
    isLoading: boolean,
  };

  constructor(props) {
    super(props)
    this.state = {
      url: LOGIN_BASE_URL + this.props.idp.entityID,
      status: '',
      isLoading: true,
    }
  }

  render() {

    return (
      <View style={StyleSheet.flatten(styles.webViewContainer)}>
        <WebView
          ref={WEBVIEW_REF}
          style={StyleSheet.flatten(styles.webView)}
          source={{uri: this.state.url}}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onNavigationStateChange={this._onNavigationStateChange}
        />
        <View style={StyleSheet.flatten(styles.statusBar)}>
          <Text style={StyleSheet.flatten(styles.statusBarText)}>{this.state.status}</Text>
        </View>
      </View>
    )
  }

  _onNavigationStateChange = (navState) => {
    const url = navState.url
    const tokenPathPos = url.indexOf(TOKEN_PATH_PREFIX)
    if(tokenPathPos === -1) {
      this.setState({
        status: navState.title,
        isLoading: navState.loading,
      })
    } else {
      const token = url.substr(tokenPathPos + TOKEN_PATH_PREFIX.length)
      if(token && token.length > 0) {
        this.props.onSuccess(token)
      } else {
        this.props.onError('NO_AUTH_TOKEN')
      }
    }
    return(true)
  };

}

/**
 * Schermata di selezione dell'Identiry Provider SPID
 */
class IdpSelectionScreen extends React.Component {

  props: {
    closeModal: () => void,
    onSpidLogin: (string, string) => void,
  }

  state: {
    selectedIdp: ?IdentityProvider,
  }

  constructor(props) {
    super(props)
    this.state = {
      selectedIdp: null,
    }
  }

  selectIdp(idp: IdentityProvider) {
    this.setState({
      selectedIdp: idp,
    })
  }

  resetIdp() {
    this.setState({
      selectedIdp: null,
    })
  }

  createButtons() {
    return idps.map((idp: IdentityProvider) => {
      return (
        <Button iconRight light block key={idp.id} style={StyleSheet.flatten(styles.idpButton)} onPress={() => {
          this.selectIdp(idp)
        }}>
          <Image
            source={idp.logo}
            style={styles.idpLogo}
          />
          <Text style={StyleSheet.flatten(styles.idpName)}>{idp.name}</Text>
          <Icon name='chevron-right' />
        </Button>
      )
    })
  }

    // Handler per il bottone back dello schermo di selezione dell'IdP
  _handleBack() {
    if(this.state.selectedIdp != null) {
      // se è già stato scelto un IdP, torniamo alla scelta
      this.resetIdp()
    } else {
      // se non è ancora stato scelto un IdP
      // chiudiamo la modal di selezione
      this.props.closeModal()
    }
  }

  render() {
    const { selectedIdp } = this.state
    return(
			<Container>
        <Header>
          <Left>
              <Button transparent onPress={() => { this._handleBack() }}>
                  <Icon name='chevron-left' />
              </Button>
          </Left>
          <Body>
            <Title>ACCEDI</Title>
          </Body>
          <Right />
        </Header>
        {
          selectedIdp != null ?
            <SpidLoginWebview
              idp={selectedIdp}
              onSuccess={(token) => this._handleSpidSuccess(token)}
              onError={(err) => this._handleSpidError(err)}
              />
            : <Content style={StyleSheet.flatten(styles.selectIdpContainer)}>
                <Text style={StyleSheet.flatten(styles.selectIdpHelpText)}>Per procedere all'accesso, seleziona il gestione della tua identità SPID</Text>
                {this.createButtons()}
              </Content>
        }
			</Container>
    )
  }

  _handleSpidSuccess(token) {
    const selectedIdp = this.state.selectedIdp
    if(selectedIdp != null) {
      this.props.closeModal()
      // ad autenticazione avvenuta, viene chiamata onSpidLogin
      // passando il token di sessione e l'idendificativo dell'IdP
      this.props.onSpidLogin(token, selectedIdp.id)
    }
  }

  _handleSpidError() {
    Alert.alert(
          'Errore login',
          'Mi spiace, si è verificato un errore durante l\'accesso, potresti riprovare?',
          { text: 'OK' },
        )
    this.resetIdp()
  }

}


/**
 * Bottone di login SPID.
 */
export class SpidLoginButton extends React.Component {

  props: {
    onSpidLogin: (string, string) => void,
  }

  state = {
    isModalVisible: false,
  }

  setModalVisible(isVisible: boolean) {
    this.setState({
      isModalVisible: isVisible
    })
  }

  render() {
    return (
      <View>
        <Modal
          animationType={'fade'}
          transparent={false}
          visible={this.state.isModalVisible}
          >
         <IdpSelectionScreen
           onSpidLogin={this.props.onSpidLogin}
           closeModal={() => {
             this.setModalVisible(false)
           }}/>
        </Modal>

        <Button
          block light bordered
          style={{backgroundColor: '#0066CC'}}
          onPress={() => {
            this.setModalVisible(true)
          }}
        >
          <Text>ENTRA CON</Text>
          <Image source={require('../../img/spid.png')} style={styles.spidLogo} />
        </Button>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectIdpContainer: {
    backgroundColor: '#0066CC',
    paddingLeft: 40,
    paddingRight: 40,
  },
  selectIdpHelpText: {
    marginTop: 20,
    marginBottom: 20,
    color: '#fff',
  },
  spidLogo: {
    height: 54,
    width: 70,
    resizeMode: 'contain',
  },
  idpButton: {
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  idpName: {
    color: '#0066CC',
    fontSize: 15,
  },
  idpLogo: {
    width: 80,
    height: 20,
    resizeMode: 'contain',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 40,
    backgroundColor: '#ccc',
  },
  statusBarText: {
    color: '#eee',
    fontSize: 13,
  },
  spinner: {
    width: 20,
    marginRight: 6,
  },
})
