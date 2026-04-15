import { Body, H4 } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useHeaderFirstLevel } from "../../../hooks/useHeaderFirstLevel";
import ROUTES from "../../../navigation/routes";

export const DSHeaderFirstLevel = () => {
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderFirstLevel({
    currentRoute: ROUTES.WALLET_HOME,
    headerProps: {
      title: "Portafoglio",
      animatedRef: scrollViewContentRef,
      actions: [
        {
          icon: "search",
          accessibilityLabel: "Tap to trigger test alert",
          onPress: () => {
            Alert.alert("Search");
          }
        },
        {
          icon: "coggle",
          accessibilityLabel: "Tap to trigger test alert",
          onPress: () => {
            Alert.alert("Settings");
          }
        }
      ]
    }
  });

  return (
    <IOScrollView
      animatedRef={scrollViewContentRef}
      actions={{
        type: "SingleButton",
        primary: {
          label: "Main action",
          onPress: () => Alert.alert("Main action pressed")
        }
      }}
    >
      <H4>Start</H4>
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
      <H4>End</H4>
    </IOScrollView>
  );
};
