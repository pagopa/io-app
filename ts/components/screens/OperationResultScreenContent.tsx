import {
  Body,
  ButtonSolid,
  H3,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import I18n from "../../i18n";

type OperationResultScreenContent = {
  pictogram?: IOPictograms;
  title: string;
  subTitle?: string;
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  action?: () => void;
};

const OperationResultScreenContent = ({
  pictogram,
  title,
  subTitle,
  actionLabel = I18n.t("global.buttons.close"),
  actionAccessibilityLabel = I18n.t("global.buttons.close"),
  action
}: OperationResultScreenContent) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
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
        {subTitle && (
          <>
            <VSpacer size={8} />
            <Body style={styles.text}>{subTitle}</Body>
          </>
        )}
        <VSpacer size={24} />
        <ButtonSolid
          label={actionLabel}
          accessibilityLabel={actionAccessibilityLabel}
          onPress={action ?? navigation.goBack}
          fullWidth={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  wrapper: {
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
