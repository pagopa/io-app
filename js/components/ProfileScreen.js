/**
 * Implements the main user screen
 *
 * @providesModule ProfileScreen
 * @flow
 */

'use strict'

const React = require('React')
const { connect } = require('react-redux')

import {
	StyleSheet,
} from 'react-native'

import {
  Container,
	Footer,
	FooterTab,
	Content,
  Button,
  Icon,
	Text,
  Badge,
} from 'native-base'

import type { Navigator } from 'react-navigation'

import type { Dispatch } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { CommonStyles } from './styles'

import AlertsComponent from './AlertsComponent'
import CalendarComponent from './CalendarComponent'
import ProfileComponent from './ProfileComponent'

type TabName = AlertsTab | CalendarTab | ProfileTab
type AlertsTab = { name: 'alerts' }
type CalendarTab = { name: 'calendar' }
type ProfileTab = { name: 'profile' }

class ProfileScreen extends React.Component {
  state: {
		activeTab: TabName,
	}

  props: {
		navigation: Navigator,
    dispatch: Dispatch,
    user: LoggedInUserState,
  }

  constructor(props) {
    super(props)
    this.state = {
      activeTab: { name: 'profile' },
    }
  }

  toggleAlertsTab() {
    this.setState({
      activeTab: { name: 'alerts' },
    })
  }

  isAlertsTabOn() {
    return this.state.activeTab.name === 'alerts'
  }

  toggleCalendarTab() {
    this.setState({
      activeTab: { name: 'calendar' },
    })
  }

  isCalendarTabOn() {
    return this.state.activeTab.name === 'calendar'
  }

  toggleProfileTab() {
    this.setState({
      activeTab: { name: 'profile' },
    })
  }

  isProfileTabOn() {
    return this.state.activeTab.name === 'profile'
  }

  renderContent() {
    if(this.isProfileTabOn()) {
      return <ProfileComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />
    } else if(this.isAlertsTabOn()) {
      return <AlertsComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />
    } else if(this.isCalendarTabOn()) {
      return <CalendarComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />
    } else {
      return <Content padder />
    }
  }

  render() {
    return(
      <Container style={StyleSheet.flatten(CommonStyles.fullContainer)}>
				{this.renderContent()}
				<Footer >
          <FooterTab>
              <Button
                badge
								active={this.isAlertsTabOn()}
								onPress={() => this.toggleAlertsTab()}
								>
                  <Badge><Text>23</Text></Badge>
                  <Icon name="notification" active={this.isAlertsTabOn()} />
                  <Text>Avvisi</Text>
              </Button>
              <Button
                badge
								active={this.isCalendarTabOn()}
								onPress={() => this.toggleCalendarTab()}
								>
                  <Badge><Text>1</Text></Badge>
                  <Icon name="calendar" active={this.isCalendarTabOn()} />
                  <Text>Scadenze</Text>
              </Button>
              <Button
								active={this.isProfileTabOn()}
								onPress={() => this.toggleProfileTab()}
								>
                  <Icon name="user" active={this.isProfileTabOn()} />
                  <Text>Profilo</Text>
              </Button>
          </FooterTab>
      </Footer>
      </Container>
    )
  }
}

function select(store) {
  return {
    user: store.user,
  }
}

module.exports = connect(select)(ProfileScreen)
