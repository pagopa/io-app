/**
 * @providesModule ProfileScreen
 * @flow
 */

'use strict';

const React = require('React');
const { connect } = require('react-redux');
import {
	StyleSheet, Platform,
} from 'react-native';
import {
  Container,
  Header,
	Footer,
	FooterTab,
	Badge,
	Right,
  Content,
  Button,
  Body,
	Title,
  H1,
  Icon,
	Text,
	Col,
	Row,
	Grid,
} from 'native-base';

import type { Navigator } from 'react-navigation';

import type { Action } from '../actions/types';
import type { UserState } from '../reducers/user';

const {
	logOut,
} = require('../actions');

import { TitilliumRegular } from './fonts';

const AlertsComponent = require('./AlertsComponent');
const ProfileComponent = require('./ProfileComponent');
const PreferencesComponent = require('./PreferencesComponent');

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
	header: {
		fontSize: 22,
		fontFamily: TitilliumRegular,
	},
});

type TabName = AlertsTab | ProfileTab | PreferencesTab;
type AlertsTab = { name: 'alerts' };
type ProfileTab = { name: 'profile' };
type PreferencesTab = { name: 'preferences' };

class ProfileScreen extends React.Component {
	state: {
		activeTab: TabName,
	};

  props: {
		navigation: Navigator,
    dispatch: (action: Action) => void;
    user: UserState;
  };

	constructor(props) {
		super(props);
		this.state = {
			activeTab: { name: 'alerts' },
		};
	}

	toggleAlertsTab() {
		this.setState({
			activeTab: { name: 'alerts' },
		});
	}

	isAlertsTabOn() {
		return this.state.activeTab.name === "alerts";
	}

	toggleProfileTab() {
		this.setState({
			activeTab: { name: 'profile' },
		});
	}

	isProfileTabOn() {
		return this.state.activeTab.name === "profile";
	}

	togglePreferencesTab() {
		this.setState({
			activeTab: { name: 'preferences' },
		});
	}

	isPreferencesTabOn() {
		return this.state.activeTab.name === "preferences";
	}

	renderContent() {
		if(this.isProfileTabOn()) {
			return <ProfileComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />;
		} else if(this.isPreferencesTabOn()) {
			return <PreferencesComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />;
		} else if(this.isAlertsTabOn()) {
			return <AlertsComponent
				navigation={this.props.navigation}
				dispatch={this.props.dispatch}
				user={this.props.user} />;
		} else {
			return <Content padder />;
		}
	}

  render() {
    return(
      <Container>
        <Header>
					<Body>
						<Title style={StyleSheet.flatten(styles.header)}>{this.props.user.name}</Title>
					</Body>
				</Header>
				{this.renderContent()}
				<Footer >
          <FooterTab>
              <Button
								active={this.isAlertsTabOn()}
								onPress={() => this.toggleAlertsTab()}
								badgeValue={2} badgeColor="blue"
								>
                  <Icon name="archive" active={this.isAlertsTabOn()} />
                  <Text>Avvisi</Text>
              </Button>
              <Button
								active={this.isProfileTabOn()}
								onPress={() => this.toggleProfileTab()}
								>
                  <Icon name="person" active={this.isProfileTabOn()} />
                  <Text>Profilo</Text>
              </Button>
							<Button
								active={this.isPreferencesTabOn()}
								onPress={() => this.togglePreferencesTab()}
								>
                  <Icon name="settings" active={this.isPreferencesTabOn()} />
                  <Text>Preferenze</Text>
              </Button>
          </FooterTab>
      </Footer>
      </Container>
    );
  }
}


function select(store) {
  return {
    user: store.user,
  };
}

module.exports = connect(select)(ProfileScreen);
