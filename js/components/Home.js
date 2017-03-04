/**
 * @providesModule Home
 * @flow
 */

'use strict';

var React = require('React');
var AppState = require('AppState');
var LoginScreen = require('./LoginScreen');
var StyleSheet = require('StyleSheet');
var View = require('View');
var StatusBar = require('StatusBar');
// var {
//   loadConfig,
// } = require('./actions');
var { connect } = require('react-redux');

var Home = React.createClass({

  render: function() {
    if (!this.props.isLoggedIn) {
      return <LoginScreen />;
    }
    return (
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          barStyle="light-content"
         />
      </View>
    );
  },

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function select(store) {
  return {
    isLoggedIn: store.user.isLoggedIn,
  };
}

module.exports = connect(select)(Home);
