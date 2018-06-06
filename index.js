/**
 * Main app entrypoint
 */

import { AppRegistry } from 'react-native'
import App from './ts/App'

// Temporary workaround for @https://github.com/facebook/react-native/issues/18868
// TODO: Remove this as soon as it has been fixed @https://www.pivotaltracker.com/story/show/158144437 
import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])

AppRegistry.registerComponent('ItaliaApp', () => App)
