import { Ref } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

export const TabNavigationContainer = ({
  ref: _ref
}: {
  ref?: Ref<PagerView>;
}) => (
  <View testID="mock_tab_navigation_container">
    This is a mock for TabNavigationContainer
  </View>
);
