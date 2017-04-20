/**
 * @flow
 */

'use strict'

import {
	Platform,
} from 'react-native'

module.exports = {
  TitilliumRegular: (Platform.OS === 'ios') ? 'Titillium Web' : 'Titillium Web_Regular',
}
