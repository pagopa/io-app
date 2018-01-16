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
  Title,
  Content,
  Icon,
  Text,
  Button,
  View
} from 'native-base'

import type { Navigator } from 'react-navigation'
import SpidUpdateNotification from './SpidUpdateNotification'
import { ROUTES } from '../utils/constants'
import { Privacy } from './Privacy'

import { CommonStyles } from './styles'

import I18n from '../i18n'

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#D8D8D8',
    paddingTop: 65,
    paddingLeft: 24,
    paddingRight: 24
  },
  textLink: {
    position: 'relative',
    left: 0
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
  },
  footerButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  modalText: {
    position: 'relative',
    left: 0
  },
  marginModal: {
    marginTop: 5
  },
  paddingModal: {
    paddingTop: 15
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
              {I18n.t('noSpidScreen.header.line1')}
            </Title>
          </Body>
        </Header>
        <Content style={styles.content}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text
              style={[styles.title, StyleSheet.flatten(CommonStyles.titleFont)]}
            >
              {I18n.t('noSpidScreen.header.title')}
            </Text>
            <Text style={{ backgroundColor: 'gray', width: 50 }} />
          </View>
          <View style={{ paddingTop: 10 }}>
            <Text
              style={[styles.text, StyleSheet.flatten(CommonStyles.textFont)]}
            >
              {I18n.t('noSpidScreen.content.line1')}
            </Text>
          </View>
          <Text
            style={[styles.textLink, StyleSheet.flatten(CommonStyles.textLink)]}
            onPress={() => {
              this.props.navigation.goBack(null)
            }}
          >
            {I18n.t('noSpidScreen.content.line2')}{' '}
          </Text>

          <View>
            <Modal
              animationType={'slide'}
              transparent={false}
              visible={this.state.isModalVisible}
            >
              <Privacy
                closeModal={() => {
                  this.setModalVisible(false)
                }}
              />
            </Modal>
          </View>

          <SpidUpdateNotification />

          <View style={styles.paddingModal}>
            <View style={styles.marginModal}>
              <Text
                style={[styles.text, StyleSheet.flatten(CommonStyles.textFont)]}
              >
                {I18n.t('noSpidScreen.content.line3')}{' '}
              </Text>
            </View>
            <View style={styles.modalText}>
              <Text
                style={[
                  styles.textLink,
                  StyleSheet.flatten(CommonStyles.textLink)
                ]}
                onPress={() => {
                  this.setModalVisible(true)
                }}
              >
                {I18n.t('noSpidScreen.content.line4')}{' '}
              </Text>
            </View>
          </View>
        </Content>
        <Footer style={styles.footer}>
          <View style={styles.footerButton}>
            <Button
              style={styles.buttonNextPage}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.INFO_REGISTRATION)
              }
            >
              <Text> {I18n.t('noSpidScreen.footer.line1')} </Text>
            </Button>
          </View>
        </Footer>
      </Container>
    )
  }
}

module.exports = NotSpidScreen
