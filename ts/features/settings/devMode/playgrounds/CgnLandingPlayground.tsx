import {
  ContentWrapper,
  VSpacer,
  VStack,
  TextInput,
  FooterActionsInline,
  useFooterActionsInlineMeasurements
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";
import I18n from "i18next";
import { IOSpacing } from "@pagopa/io-app-design-system/src/core";
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

  const {
    footerActionsInlineMeasurements,
    handleFooterActionsInlineMeasurements
  } = useFooterActionsInlineMeasurements();

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <View style={{ flex: 1 }}>
      <ContentWrapper>
        <VStack space={8}>
          <TextInput
            placeholder={I18n.t("bonus.cgn.playgrounds.link.placeholder")}
            accessibilityLabel={I18n.t(
              "bonus.cgn.playgrounds.link.placeholder"
            )}
            onChangeText={setNavigationUri}
            value={navigationURI}
            textInputProps={{
              keyboardType: "url",
              autoCapitalize: "none",
              autoCorrect: false
            }}
          />
          <TextInput
            placeholder={I18n.t("bonus.cgn.playgrounds.referer.placeholder")}
            accessibilityLabel={I18n.t(
              "bonus.cgn.playgrounds.referer.placeholder"
            )}
            onChangeText={setRefererValue}
            value={refererValue}
            textInputProps={{
              autoCapitalize: "none",
              autoCorrect: false
            }}
          />
        </VStack>
      </ContentWrapper>
      <VSpacer size={8} />
      <View
        style={{
          flex: 1,
          marginBottom:
            footerActionsInlineMeasurements.safeBottomAreaHeight -
            IOSpacing.screenEndMargin
        }}
      >
        {source && (
          <WebviewComponent
            playgroundEnabled
            key={`${reloadKey}_webview`}
            source={source}
          />
        )}
      </View>
      <FooterActionsInline
        onMeasure={handleFooterActionsInlineMeasurements}
        startAction={{
          color: "primary",
          icon: "reload",
          label: I18n.t("global.accessibility.reload"),
          accessibilityLabel: I18n.t("global.accessibility.reload"),
          onPress: () => setReloadKey(r => r + 1)
        }}
        endAction={{
          color: "primary",
          label: I18n.t("bonus.cgn.playgrounds.send"),
          accessibilityLabel: I18n.t("bonus.cgn.playgrounds.send"),
          onPress: () =>
            setSource({
              uri: navigationURI,
              headers: {
                "X-PagoPa-CGN-Referer": refererValue
              }
            })
        }}
      />
    </View>
  );
};

export default CgnLandingPlayground;
