import {
  FooterActionsInline,
  useIOColors,
  VSpacer
} from "@io-app/design-system";
import { Fragment } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActionsInlineNotFixed = () => {
  const colors = useIOColors();

  return (
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
      <FooterActionsInline
        endAction={{
          label: "Primary",
          onPress: onButtonPress
        }}
        fixed={false}
        startAction={{
          label: "Secondary",
          onPress: onButtonPress
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  block: {
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 10
  }
});
