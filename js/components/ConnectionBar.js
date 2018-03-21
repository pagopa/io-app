/**
 * @flow
 */

import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'

import I18n from '../i18n'

import { type ReduxProps } from '../actions/types'
import { type GlobalState } from '../reducers/types'

type ReduxMappedProps = {
  isConnected: boolean
}

type OwnProps = {}

type Props = ReduxMappedProps & ReduxProps & OwnProps

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    height: 30,
    paddingLeft: 20
  }
})

/**
 * Implements a component that show a message when there is no network connection
 */
class ConnectionBar extends React.PureComponent<Props> {
  render(): React.Node {
    const { isConnected } = this.props
    if (isConnected) {
      return null
    }
    return (
      <View style={styles.container}>
        <Text>{I18n.t('connection.status.offline')}</Text>
      </View>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected
})

export default connect(mapStateToProps)(ConnectionBar)
