import {
  ContentWrapper,
  FooterActionsInline,
  IOSpacing,
  TextInput,
  useFooterActionsInlineMeasurements,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { useState } from "react";
import { View } from "react-native";
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
            accessibilityLabel={I18n.t(
              "bonus.cgn.playgrounds.link.placeholder"
            )}
            onChangeText={setNavigationUri}
            placeholder={I18n.t("bonus.cgn.playgrounds.link.placeholder")}
            textInputProps={{
              keyboardType: "url",
              autoCapitalize: "none",
              autoCorrect: false
            }}
            value={navigationURI}
          />
          <TextInput
            accessibilityLabel={I18n.t(
              "bonus.cgn.playgrounds.referer.placeholder"
            )}
            onChangeText={setRefererValue}
            placeholder={I18n.t("bonus.cgn.playgrounds.referer.placeholder")}
            textInputProps={{
              autoCapitalize: "none",
              autoCorrect: false
            }}
            value={refererValue}
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
            key={`${reloadKey}_webview`}
            playgroundEnabled
            source={source}
          />
        )}
      </View>
      <FooterActionsInline
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
        onMeasure={handleFooterActionsInlineMeasurements}
        startAction={{
          color: "primary",
          icon: "reload",
          label: I18n.t("global.accessibility.reload"),
          accessibilityLabel: I18n.t("global.accessibility.reload"),
          onPress: () => setReloadKey(r => r + 1)
        }}
      />
    </View>
  );
};

export default CgnLandingPlayground;
