/**
 * @flow
 */

import React from 'react';

var configureStore = require('./store/configureStore');
var { Provider } = require('react-redux');

var Home = require('./components/Home');

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
        store: configureStore(() => this.setState({isLoading: false})),
      };
    }
    render() {
      if (this.state.isLoading) {
        return null;
      }
      return (
        <Provider store={this.state.store}>
          <Home />
        </Provider>
      );
    }
  }

  return Root;
}

module.exports = setup;
