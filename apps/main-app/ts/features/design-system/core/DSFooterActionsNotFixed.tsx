import { FooterActions, useIOColors, VSpacer } from "@io-app/design-system";
import { Fragment } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActionsNotFixed = () => {
  const colors = useIOColors();

  return (
    <View style={styles.container}>
      <ScrollView>
        {[...Array(9)].map((_el, i) => (
          <Fragment key={`view-${i}`}>
            <View
              style={[
                styles.block,
                {
                  backgroundColor: colors.surface.secondary
                }
              ]}
            >
              <Text style={{ color: colors.text.content.tertiary }}>
                {`Block ${i}`}
              </Text>
            </View>
            <VSpacer size={4} />
          </Fragment>
        ))}
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
          fixed={false}
        />
      </ScrollView>
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
