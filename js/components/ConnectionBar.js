/**
 * @flow
 */

import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import type { MapStateToProps } from 'react-redux'

import I18n from '../i18n'

type Props = {
  isConnected: boolean
}

/**
 * Implements a component that show a message when there is no network connection
 */
class ConnectionBar extends React.PureComponent<Props> {
  render() {
    const { isConnected } = this.props
    if (isConnected) return null
    return (
      <View style={styles.container}>
        <Text>{I18n.t('connection.status.offline')}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    height: 30,
    paddingLeft: 20
  }
})

const mapStateToProps: MapStateToProps<*, *, *> = (state: Object) => ({
  isConnected: state.network.isConnected
})

module.exports = connect(mapStateToProps)(ConnectionBar)
