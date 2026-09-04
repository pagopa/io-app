import {
  IOColors,
  ScrollViewWithStickyFooterActions,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import { Fragment } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActionsSticky = () => {
  const theme = useIOTheme();

  return (
    <ScrollViewWithStickyFooterActions
      afterPlaceholder={
        <View style={[styles.block, styles.footer]}>
          <Text>{`Footer`}</Text>
        </View>
      }
      beforePlaceholder={[...Array(9)].map((_el, i) => (
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
      footerActionProps={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: "Pay button",
            onPress: onButtonPress
          },
          secondary: {
            label: "Secondary link",
            onPress: onButtonPress
          }
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  block: {
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 10
  },
  footer: {
    backgroundColor: IOColors["success-100"]
  }
});
