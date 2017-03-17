
/**
 * @flow
 */

'use strict';

const React = require('React');
import {
	StyleSheet
} from 'react-native';

import { TitilliumRegular } from './fonts';

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const ProfileStyles = StyleSheet.create({
	listItemHeader: {
		fontFamily: TitilliumRegular,
	},
	listItem: {
		color: '#06C',
		fontWeight: 'bold',
		fontFamily: TitilliumRegular,
		marginLeft: 20,
	},
});

module.exports = {
  ProfileStyles,
};
