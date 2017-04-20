/**
 * @flow
 */

'use strict';

// import './reactotron';

import React from 'react';

import { StackNavigator } from 'react-navigation';

const configureStore = require('./store/configureStore');
const { Provider } = require('react-redux');

const LoginScreen = require('./components/LoginScreen');
const ProfileScreen = require('./components/ProfileScreen');

function setup(): ReactClass<{}> {

  class Root extends React.Component {

    state: {
      isLoading: boolean;
      store: any;
    };

    constructor() {
      super();
      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({ isLoading: false })),
      };
    }

    render() {
      if (this.state.isLoading) {
        return null;
      }

      const App = StackNavigator({
        Home: {
          screen: LoginScreen,
        },

        Profile: {
          screen: ProfileScreen,
        }
      }, {
        headerMode: 'none'
      });

      return (
        <Provider store={this.state.store}>
          <App />
        </Provider>
      );
    }
  }

  return Root;
}

module.exports = setup;
