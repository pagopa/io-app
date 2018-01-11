/**
 * Implements the No Spid Screen
 *
 * @providesModule NoSpidScreen
 * @flow
 */

'use strict'

const React = require('React')
const ReactNative = require('react-native')
const { StyleSheet, Modal } = ReactNative

import {
  Container,
  Header,
  Left,
  Footer,
  Body,
  Right,
  Title,
  Content,
  Icon,
  Text,
  Button,
  Image,
  Item,
  View
} from 'native-base'

import type { Navigator } from 'react-navigation'
import SpidUpdateNotification from './SpidUpdateNotification'
import { ROUTES } from '../utils/constants'
import { PersonalData } from './Privacy'

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#D8D8D8',
    paddingTop: 65,
    paddingLeft: 24,
    paddingRight: 24
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#13253C',
    fontFamily: 'Titillium Web'
  },
  text: {
    fontFamily: 'Titillium Web',
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5B6F'
  },
  textLink: {
    position: 'relative',
    left: 0,
    fontFamily: 'Titillium Web',
    fontSize: 16,
    lineHeight: 24,
    color: '#004BC4',
    fontWeight: 'bold'
  },
  buttonNextPage: {
    justifyContent: 'center',
    height: 40,
    width: 300,
    borderRadius: 4,
    backgroundColor: '#0073e6'
  },
  footer: {
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    justifyContent: 'center'
  }
})

class NotSpidScreen extends React.Component {
  props: {
    navigation: Navigator
  }

  state = {
    isModalVisible: false
  }

  setModalVisible(isVisible: boolean) {
    this.setState({
      isModalVisible: isVisible
    })
  }

  render() {
    return (
      <Container>
        <Header
          style={{ backgroundColor: '#FFFFFF', borderBottomColor: '#D8D8D8' }}
        >
          <Left style={{ flex: 1 }}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.goBack(null)
              }}
            >
              <Icon name="chevron-left" style={{ color: '#17324D' }} />
            </Button>
          </Left>
          <Body style={{ flex: 7 }}>
            <Title style={{ color: '#13253C' }}>
              {' '}
              Inserisci indirizzo email
            </Title>
          </Body>
        </Header>
        <Content style={styles.content}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.title}>Non hai SPID?</Text>
            <Text style={{ backgroundColor: 'gray', width: 50 }} />
          </View>
          <View style={{ paddingTop: 10 }}>
            <Text style={styles.text}>
              SPID, il Sistema Pubblico di Identità Digitale, ti permette di
              accedere a tutti i servizi della Pubblica Amministrazione con
              un'unica identità Digitale (username e password).
            </Text>
          </View>
          <Text
            style={styles.textLink}
            onPress={() => {
              this.props.navigation.goBack(null)
            }}
          >
            Per Saperne di più{' '}
          </Text>

          <View>
            <Modal
              animationType={'slide'}
              transparent={false}
              visible={this.state.isModalVisible}
            >
              <PersonalData
                closeModal={() => {
                  this.setModalVisible(false)
                }}
              />
            </Modal>
          </View>

          <SpidUpdateNotification />

          <View style={{ paddingTop: 15 }}>
            <View style={{ marginTop: 5 }}>
              <Text style={styles.text}>
                Proseguendo dichiari di accettare le{' '}
              </Text>
            </View>
            <View style={{ position: 'relative', left: 0 }}>
              <Text
                style={styles.textLink}
                onPress={() => {
                  this.setModalVisible(true)
                }}
              >
                regole sul trattamento dei dati personali
              </Text>
            </View>
          </View>
        </Content>
        <Footer style={styles.footer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              style={styles.buttonNextPage}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.INFO_REGISTRATION)
              }
            >
              <Text> Continua</Text>
            </Button>
          </View>
        </Footer>
      </Container>
    )
  }
}

module.exports = NotSpidScreen
