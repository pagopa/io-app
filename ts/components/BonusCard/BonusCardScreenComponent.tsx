import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BonusCard, BonusCardProps } from ".";

const triggerOffsetValue: number = 32;

export type BonusScreenComponentProps = {
  children?: React.ReactElement;
} & BonusCardProps;

const BonusCardScreenComponent = (props: BonusScreenComponentProps) => {
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          scrollValues={{
            contentOffsetY: translationY,
            triggerOffset: triggerOffsetValue
          }}
          title={""}
          goBack={() => navigation.goBack()}
          backAccessibilityLabel="Torna indietro"
          transparent={true}
          type="twoActions"
          firstAction={{
            icon: "help",
            onPress: () => {
              Alert.alert("Contextual Help");
            },
            accessibilityLabel: ""
          }}
          secondAction={{
            icon: "info",
            onPress: () => {
              Alert.alert("info");
            },
            accessibilityLabel: ""
          }}
        />
      ),
      headerTransparent: true
    });
  }, [navigation, translationY]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, triggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <BonusCard {...props} />
      {props.children}
    </Animated.ScrollView>
  );
};

export { BonusCardScreenComponent };
