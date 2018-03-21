/**
 * Main app entrypoint
 *
 * @flow
 */

import * as React from 'react'
import { AppRegistry } from 'react-native'
import App from './App'

AppRegistry.registerComponent('ItaliaApp', (): React.ComponentType<*> => App)
