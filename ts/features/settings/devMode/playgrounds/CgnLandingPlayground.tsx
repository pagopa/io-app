import {
  H6,
  IOButton,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";
import WebviewComponent from "../../../../components/WebviewComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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
  const [navigationURI, setNavigationUri] = useState("https://google.it");
  const [refererValue, setRefererValue] = useState("");
  const [source, setSource] = useState<WebViewSourceUri>({
    uri: "https://google.it",
    headers: undefined
  });
  const [reloadKey, setReloadKey] = useState(0);

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          flexGrow: 1
        }}
      >
        <View>
          <H6>{"Link alla landing"}</H6>
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
          <H6>{"Referer"}</H6>
          <TextInput
            accessibilityLabel="Referer field"
            style={styles.textInput}
            onChangeText={setRefererValue}
            value={refererValue}
          />
        </View>
        <VSpacer size={16} />
        <View style={styles.row}>
          <IOButton
            variant="outline"
            icon="reload"
            label="Reload"
            accessibilityLabel="Reload"
            onPress={() => setReloadKey(r => r + 1)}
          />
          <IOButton
            variant="solid"
            label="Invia"
            onPress={() => {
              setSource({
                uri: navigationURI,
                headers: {
                  "X-PagoPa-CGN-Referer": refererValue
                }
              });
            }}
            accessibilityLabel={"Invia"}
          />
        </View>
        <VSpacer size={16} />
        <View style={{ flex: 1 }}>
          {source && (
            <WebviewComponent
              playgroundEnabled
              key={`${reloadKey}_webview`}
              source={source}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CgnLandingPlayground;
