/**
 * Implements the Privacy rules.
 *
 * @providesModule Provacy
 * @flow
 */

'use strict'

const React = require('React')

import { StyleSheet, View, Text } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'

import I18n from '../i18n'
import { PrivacyStyle } from './styles'
import { CommonStyles } from './styles'
export class Privacy extends React.Component {
  props: {
    closeModal: () => void
  }
  _handleBack() {
    this.props.closeModal()
  }
  render() {
    return (
      <View style={StyleSheet.flatten(PrivacyStyle.content)}>
        <Icon
          name="md-close"
          style={StyleSheet.flatten(PrivacyStyle.closeModal)}
          onPress={() => {
            this._handleBack()
          }}
        />

        <Text
          style={[
            StyleSheet.flatten(PrivacyStyle.title),
            StyleSheet.flatten(CommonStyles.titleFont)
          ]}
        >
          {I18n.t('privacy.title')}
        </Text>
        <Text
          style={[
            StyleSheet.flatten(PrivacyStyle.mainText),
            StyleSheet.flatten(CommonStyles.textFont)
          ]}
        >
          {I18n.t('privacy.line1')}
        </Text>
      </View>
    )
  }
}
