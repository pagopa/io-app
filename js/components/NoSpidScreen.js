/**
 * Implements the No Spid Screen
 *
 * @providesModule NoSpidScreen
 * @flow
 */

'use strict'

const React = require('React')
const ReactNative = require('react-native')
const { StyleSheet } = ReactNative

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
import Modal from 'react-native-modal'
import I18n from '../i18n'

/**
 * Implements the screen called when the user click on don't you have spid?.
 */
class NoSpidScreen extends React.Component {
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
        <Header style={StyleSheet.flatten(CommonStyles.header)}>
          <Left style={StyleSheet.flatten(CommonStyles.leftHeader)}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.goBack(null)
              }}
            >
              <Icon
                name="chevron-left"
                style={StyleSheet.flatten(CommonStyles.iconChevronLeft)}
              />
            </Button>
          </Left>
          <Body style={{ flex: 7 }}>
            <Title style={StyleSheet.flatten(CommonStyles.titleFont)}>
              {I18n.t('noSpidScreen.header.line1')}
            </Title>
          </Body>
        </Header>
        <Content style={StyleSheet.flatten(CommonStyles.pageContent)}>
          <Title style={StyleSheet.flatten(CommonStyles.mainTitlteFont)}>
            {I18n.t('noSpidScreen.header.title')}
          </Title>
          <View>
            <Text>{I18n.t('noSpidScreen.content.line1')}</Text>
          </View>
          <Text
            style={StyleSheet.flatten(CommonStyles.textLink)}
            onPress={() => {
              this.props.navigation.goBack(null)
            }}
          >
            {I18n.t('noSpidScreen.content.line2')}{' '}
          </Text>

          <View>
            <Modal isVisible={this.state.isModalVisible}>
              <Privacy
                closeModal={() => {
                  this.setModalVisible(false)
                }}
              />
            </Modal>
          </View>

          <SpidUpdateNotification />

          <View style={NoSpidScreenStyle.paddingModal}>
            <View style={NoSpidScreenStyle.marginModal}>
              <Text>{I18n.t('noSpidScreen.content.line3')} </Text>
            </View>
            <View>
              <Text
                style={StyleSheet.flatten(CommonStyles.textLink)}
                onPress={() => {
                  this.setModalVisible(true)
                }}
              >
                {I18n.t('noSpidScreen.content.line4')}{' '}
              </Text>
            </View>
          </View>
        </Content>
        <Footer style={StyleSheet.flatten(CommonStyles.footer)}>
          <View style={StyleSheet.flatten(CommonStyles.buttonFooterContainer)}>
            <Button
              style={StyleSheet.flatten(CommonStyles.buttonFooter)}
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

module.exports = NoSpidScreen

const NoSpidScreenStyle = StyleSheet.create({
  contentFirstView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})
