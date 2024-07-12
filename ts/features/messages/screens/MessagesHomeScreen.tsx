import React, { useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { IOStyles } from "@pagopa/io-app-design-system";
import { PagerViewContainer } from "../components/Home/PagerViewContainer";
import { TabNavigationContainer } from "../components/Home/TabNavigationContainer";
import { SecuritySuggestions } from "../components/Home/SecuritySuggestions";
import { Toasts } from "../components/Home/Toasts";
import { Preconditions } from "../components/Home/Preconditions";
import { AndroidVersionLessThen25UnsupportedDevicesStatusComponent } from "../../../screens/authentication/LandingScreen";

export const MessagesHomeScreen = () => {
  const pagerViewRef = useRef<PagerView>(null);
  return (
    <View style={IOStyles.flex}>
      <Toasts />
      <TabNavigationContainer pagerViewRef={pagerViewRef} />
      <PagerViewContainer ref={pagerViewRef} />
      <Preconditions />
      <AndroidVersionLessThen25UnsupportedDevicesStatusComponent />
      <SecuritySuggestions />
    </View>
  );
};
