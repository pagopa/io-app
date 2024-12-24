import { forwardRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

export const PagerViewContainer = forwardRef<PagerView>((_, ref) => (
  <PagerView ref={ref} testID="mock_pager_view_container">
    <View>Mock Inbox</View>
    <View>Mock Archive</View>
  </PagerView>
));
