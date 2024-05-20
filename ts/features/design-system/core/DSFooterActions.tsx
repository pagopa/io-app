import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../components/ui/FooterActions";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActions = () => {
  const [footerActionsMeasurements, setfooterActionsMeasurements] =
    useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  const handleFooterActionsMeasurements = (
    values: FooterActionsMeasurements
  ) => {
    setfooterActionsMeasurements(values);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
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
        onMeasure={handleFooterActionsMeasurements}
        actions={{
          type: "SingleButton",
          primary: {
            label: "Pay button",
            onPress: onButtonPress
          }
          // secondary: {
          //   label: "Secondary link",
          //   onPress: onButtonPress
          // },
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
