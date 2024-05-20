import {
  ButtonLink,
  ButtonSolid,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FooterActions } from "../../../components/ui/FooterActions";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActions = () => {
  const scrollY = useSharedValue<number>(0);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView>
        {[...Array(9)].map((_el, i) => (
          <React.Fragment key={`view-${i}`}>
            <View style={styles.block}>
              <Text>{`Block ${i}`}</Text>
            </View>
            <VSpacer size={4} />
          </React.Fragment>
        ))}
      </ScrollView>
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: "Pay button",
            onPress: onButtonPress
          },
          secondary: {
            label: "Secondary link",
            onPress: onButtonPress
          }
          // tertiary: {
          //   label: "Tertiary link",
          //   onPress: onButtonPress
          // }
        }}
      />
      {/* <Animated.View
        onLayout={getActionBlockHeight}
        style={[
          styles.actionBlockBackground,
          styles.actionBlockPosition,
          { paddingBottom: insets.bottom },
          actionBlockAnimatedStyle
        ]}
      >
        <Text style={styles.debugText}>{`Height: ${actionBlockHeight}`}</Text>
        <ButtonSolid
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Pay button"}
          onPress={onButtonPress}
        />
        <VSpacer />
        <View style={{ alignSelf: "center" }}>
          <ButtonLink
            accessibilityLabel="Tap to trigger test alert"
            label={"Secondary link"}
            onPress={onButtonPress}
          />
        </View>
      </Animated.View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  block: {
    backgroundColor: IOColors["grey-100"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 9
  }
});
