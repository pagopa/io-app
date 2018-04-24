/* eslint-disable flowtype/require-return-type,react/display-name,react/prop-types */
// @flow

import * as React from 'react'
import { TabBarBottom, TabNavigator } from 'react-navigation'

import ROUTES from './routes'
import MessagesScreen from '../screens/main/MessagesScreen'
import ProfileScreen from '../screens/main/ProfileScreen'
import PortfolioNavigator from './PortfolioNavigator'
import { Icon } from 'native-base'

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = TabNavigator(
  {
    [ROUTES.MAIN_MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.PORTFOLIO_HOME]: {
      screen: PortfolioNavigator
    },
    [ROUTES.DOCUMENTS_HOME]: {
      screen: PortfolioNavigator
    },
    [ROUTES.PREFERENCES_HOME]: {
      screen: PortfolioNavigator
    },
    [ROUTES.MAIN_PROFILE]: {
      screen: ProfileScreen
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state
        let iconName
        if (routeName === ROUTES.MAIN_MESSAGES) {
          iconName = 'mail'
        } else if (routeName === ROUTES.PORTFOLIO_HOME) {
          iconName = 'wallet'
        } else if (routeName === ROUTES.DOCUMENTS_HOME) {
          iconName = 'document'
        } else if (routeName === ROUTES.PREFERENCES_HOME) {
          iconName = 'cog'
        } else if (routeName === ROUTES.MAIN_PROFILE) {
          iconName = 'user'
        }
        return <Icon name={iconName} active={focused} />
      }
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: 'black',
      inactiveTintColor: 'gray'
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MAIN_MESSAGES
  }
)

export default navigation
