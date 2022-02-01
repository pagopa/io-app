import * as React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { withNavigationFocus } from 'react-navigation';

const FocusAwareStatusBar = withNavigationFocus<StatusBarProps>(({ isFocused, ...rest }) =>
  isFocused ? <StatusBar {...rest} /> : null
);

export default FocusAwareStatusBar;
