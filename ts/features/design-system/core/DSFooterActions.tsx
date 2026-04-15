import {
  FooterActions,
  IOColors,
  VSpacer,
  useFooterActionsMeasurements,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActions = () => {
  const theme = useIOTheme();

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        {[...Array(9)].map((_el, i) => (
          <Fragment key={`view-${i}`}>
            <View
              style={[
                styles.block,
                { backgroundColor: IOColors[theme["appBackground-secondary"]] }
              ]}
            >
              <Text style={{ color: IOColors[theme["textBody-tertiary"]] }}>
                {`Block ${i}`}
              </Text>
            </View>
            <VSpacer size={4} />
          </Fragment>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  block: {
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 10
  }
});
