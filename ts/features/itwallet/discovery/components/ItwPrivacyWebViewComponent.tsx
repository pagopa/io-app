import React from "react";
import {
  ButtonSolid,
  ContentWrapper,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import WebView from "react-native-webview";
import { View } from "react-native";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../../utils/webview";
import I18n from "../../../../i18n";
import ItwMarkdown from "../../common/components/ItwMarkdown";

type Props = {
  source: WebViewSource;
  onAcceptTos: () => void;
  onLoadEnd: () => void;
  onError: () => void;
};

const ItwPrivacyWebViewComponent = ({
  source,
  onAcceptTos,
  onLoadEnd,
  onError
}: Props) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={IOStyles.flex}>
      <WebView
        androidCameraAccessDisabled={true}
        androidMicrophoneAccessDisabled={true}
        onLoadEnd={onLoadEnd}
        onError={onError}
        textZoom={100}
        style={IOStyles.flex}
        source={source}
        injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
      />

      <View style={{ marginBottom: bottom }}>
        <ContentWrapper>
          <VSpacer size={4} />
          <ItwMarkdown>
            {I18n.t("features.itWallet.ipzsPrivacy.warning")}
          </ItwMarkdown>
          <ButtonSolid
            fullWidth={true}
            label={I18n.t("features.itWallet.ipzsPrivacy.button.label")}
            accessibilityLabel={I18n.t(
              "features.itWallet.ipzsPrivacy.button.label"
            )}
            onPress={onAcceptTos}
          />
        </ContentWrapper>
      </View>
    </View>
  );
};

export default ItwPrivacyWebViewComponent;
