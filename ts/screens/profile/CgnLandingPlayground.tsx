import {
  ButtonOutline,
  ButtonSolid,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import WebviewComponent from "../../components/WebviewComponent";
import { H5 } from "../../components/core/typography/H5";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";

const styles = StyleSheet.create({
  textInput: {
    padding: 8,
    borderWidth: 1,
    height: 40,
    color: IOColors.black,
    borderRadius: 8,
    borderColor: IOColors["grey-450"]
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const CgnLandingPlayground = () => {
  const [navigationURI, setNavigationUri] = React.useState("https://");
  const [refererValue, setRefererValue] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("https://google.com");
  const [reloadKey, setReloadKey] = React.useState(0);

  useHeaderSecondLevel({
    title: "CGN Landing Playground"
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView
        contentContainerStyle={[
          { paddingHorizontal: IOVisualCostants.appMarginDefault },
          IOStyles.flex
        ]}
      >
        <View>
          <H5>{"Link alla landing"}</H5>
          <TextInput
            accessibilityLabel="URL address"
            style={styles.textInput}
            onChangeText={setNavigationUri}
            value={navigationURI}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <VSpacer size={8} />
          <H5>{"Referer"}</H5>
          <TextInput
            accessibilityLabel="Referer field"
            style={styles.textInput}
            onChangeText={setRefererValue}
            value={refererValue}
          />
        </View>
        <VSpacer size={16} />
        <View style={styles.row}>
          <ButtonOutline
            icon="reload"
            label="Reload"
            accessibilityLabel="Reload"
            onPress={() => setReloadKey(r => r + 1)}
          />
          <ButtonSolid
            label="Invia"
            onPress={() => {
              setLoadUri(navigationURI);
            }}
            accessibilityLabel={"Invia"}
          />
        </View>
        <VSpacer size={16} />
        <View style={IOStyles.flex}>
          {loadUri !== "" && (
            <WebviewComponent
              key={`${reloadKey}_webview`}
              source={{
                uri: loadUri,
                headers: {
                  referer: refererValue,
                  "X-PagoPa-CGN-Referer": refererValue
                }
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CgnLandingPlayground;
