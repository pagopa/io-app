/**
 * @providesModule Home
 * @flow
 */

'use strict';

var React = require('React');
var LoginScreen = require('./LoginScreen');
var ProfileScreen = require('./ProfileScreen');

var { connect } = require('react-redux');

const config = require('../config');

class Home extends React.Component {

  props: {
    isLoggedIn: boolean;
  };

  render() {
    if (!this.props.isLoggedIn) {
      return <LoginScreen idps={config.idps}/>;
    }
    return <ProfileScreen />;
  }

}

function select(store) {
  return {
    isLoggedIn: store.user.isLoggedIn,
  };
}

module.exports = connect(select)(Home);
