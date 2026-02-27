import { createStackNavigator } from "@react-navigation/stack";
import { ReactElement } from "react";
import { IngressScreen } from "../features/ingress/screens/IngressScreen";

const IngressStack = createStackNavigator();

const IngressStackNavigator = (): ReactElement => (
  <IngressStack.Navigator screenOptions={{ headerShown: false }}>
    <IngressStack.Screen name="INGRESS" component={IngressScreen} />
  </IngressStack.Navigator>
);

export default IngressStackNavigator;
