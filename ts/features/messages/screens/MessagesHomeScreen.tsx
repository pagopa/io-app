import React, { useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { IOStyles } from "@pagopa/io-app-design-system";
import { PagerViewContainer } from "../components/Home/PagerViewContainer";
import { TabNavigationContainer } from "../components/Home/TabNavigationContainer";

export const MessagesHomeScreen = () => {
  // console.log(`=== MessagesHomeScreen`);
  const pagerViewRef = useRef<PagerView>(null);
  return (
    <View style={IOStyles.flex}>
      <TabNavigationContainer pagerViewRef={pagerViewRef} />
      <PagerViewContainer ref={pagerViewRef} />
    </View>
  );
};
