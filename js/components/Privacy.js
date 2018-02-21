/**
 * Implements the Privacy rules.
 *
 * @providesModule Provacy
 * @flow
 */

'use strict'

import variables from '../../style/variables/agidStyle'

const React = require('React')

import { StyleSheet, View, Text } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'

import I18n from '../i18n'
import { CommonStyles } from './styles'

/**
 * Implements the content of modal that contains the privacy policy information.
 */
export class Privacy extends React.Component {
  props: {
    closeModal: () => void
  }
  _handleBack() {
    this.props.closeModal()
  }
  render() {
    return (
      <View style={PrivacyStyle.content}>
        <Icon
          name="md-close"
          style={[
            PrivacyStyle.closeModal,
            StyleSheet.flatten(CommonStyles.icon)
          ]}
          onPress={() => {
            this._handleBack()
          }}
        />

        <Text
          style={[
            StyleSheet.flatten(CommonStyles.mainTitleFont),
            PrivacyStyle.title
          ]}
        >
          {I18n.t('privacy.title')}
        </Text>
        <Text
          style={[
            PrivacyStyle.mainText,
            StyleSheet.flatten(CommonStyles.mainText)
          ]}
        >
          {I18n.t('privacy.line1')}
        </Text>
      </View>
    )
  }
}

const PrivacyStyle = StyleSheet.create({
  content: {
    backgroundColor: variables.contentBackgroudColor,
    flex: 1,
    paddingLeft: variables.contentPaddingLeft,
    paddingRight: variables.contentPaddingRight
  },
  closeModal: {
    textAlign: 'right',
    paddingTop: 15
  },
  title: {
    paddingTop: 50
  },
  mainText: {
    paddingTop: 15
  }
})
