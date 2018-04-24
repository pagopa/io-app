import * as React from 'react'
import { AppState, StatusBar } from 'react-native'
import { connect } from 'react-redux'

import { Root } from 'native-base'

import ConnectionBar from './components/ConnectionBar'

import { ReduxProps, ApplicationState } from './actions/types'
import { APP_STATE_CHANGE_ACTION } from './store/actions/constants'
import Navigation from './navigation'

type ReduxMappedProps = {}

type OwnProps = {}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends React.Component<Props> {
  componentDidMount() {
    AppState.addEventListener('change', this.onApplicationActivityChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onApplicationActivityChange)
  }

  render() {
    return (
      <Root>
        <StatusBar barStyle="dark-content" />
        <ConnectionBar />
        <Navigation />
      </Root>
    )
  }

  onApplicationActivityChange = (activity: ApplicationState) => {
    this.props.dispatch({
      type: APP_STATE_CHANGE_ACTION,
      payload: activity
    })
  }
}

export default connect()(RootContainer)
