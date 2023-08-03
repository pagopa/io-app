import {
  ButtonLink,
  ButtonSolid,
  H3,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { LabelSmall } from "../core/typography/LabelSmall";

type ActionProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

type OperationResultScreenContent = {
  pictogram?: IOPictograms;
  title: string;
  subtitle?: string;
  action?: ActionProps;
  secondaryAction?: ActionProps;
};

const OperationResultScreenContent = ({
  pictogram,
  title,
  subtitle,
  action,
  secondaryAction,
  testID
}: WithTestID<OperationResultScreenContent>) => (
  <SafeAreaView style={styles.container} testID={testID}>
    <ScrollView
      centerContent={true}
      contentContainerStyle={[
        styles.wrapper,
        /* Android fallback because `centerContent` is only an iOS property */
        Platform.OS === "android" && styles.wrapper_android
      ]}
    >
      {pictogram && (
        <>
          <Pictogram name={pictogram} size={120} />
          <VSpacer size={24} />
        </>
      )}
      <H3 style={styles.text}>{title}</H3>
      {subtitle && (
        <>
          <VSpacer size={8} />
          <LabelSmall style={styles.text} color="grey-650" weight="Regular">
            {subtitle}
          </LabelSmall>
        </>
      )}
      {action && (
        <>
          <VSpacer size={24} />
          <View>
            <ButtonSolid {...action} />
          </View>
        </>
      )}
      {secondaryAction && (
        <>
          <VSpacer size={24} />
          <View>
            <ButtonLink {...secondaryAction} />
          </View>
        </>
      )}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center"
  },
  wrapper_android: {
    flexGrow: 1,
    justifyContent: "center"
  },
  text: {
    textAlign: "center"
  }
});

export { OperationResultScreenContent };
