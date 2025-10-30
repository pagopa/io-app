import {
  ContentWrapper,
  FooterActions,
  VSpacer,
  VStack,
  TextInput
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { SafeAreaView } from "react-native";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";
import WebviewComponent from "../../../../components/WebviewComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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
      <ContentWrapper>
        <VStack space={12}>
          <TextInput
            placeholder={"Link alla landing"}
            accessibilityLabel="URL address"
            onChangeText={setNavigationUri}
            value={navigationURI}
            textInputProps={{
              keyboardType: "url",
              autoCapitalize: "none",
              autoCorrect: false
            }}
          />
          <TextInput
            placeholder={"Referer"}
            accessibilityLabel="Referer field"
            onChangeText={setRefererValue}
            value={refererValue}
            textInputProps={{
              autoCapitalize: "none",
              autoCorrect: false
            }}
          />
        </VStack>
      </ContentWrapper>
      <VSpacer size={16} />
      <WebviewComponent
        playgroundEnabled
        key={`${reloadKey}_webview`}
        source={source}
      />
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: "Invia",
            accessibilityLabel: "Invia",
            onPress: () =>
              setSource({
                uri: navigationURI,
                headers: {
                  "X-PagoPa-CGN-Referer": refererValue
                }
              })
          },
          secondary: {
            icon: "reload",
            label: "Reload",
            accessibilityLabel: "Reload",
            onPress: () => setReloadKey(r => r + 1)
          }
        }}
      />
    </SafeAreaView>
  );
};

export default CgnLandingPlayground;
