import React from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

export const TabNavigationContainer = React.forwardRef<PagerView>((_, _ref) => (
  <View testID="mock_tab_navigation_container">
    This is a mock for TabNavigationContainer
  </View>
));
