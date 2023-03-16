import { View } from "native-base";
import * as React from "react";
import { ViewProps } from "react-native";
import WebView from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import I18n from "../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import FooterWithButtons from "./ui/FooterWithButtons";
import { NOTIFY_LINK_CLICK_SCRIPT } from "./ui/Markdown/script";

type Props = {
  shouldFooterRender: boolean;
  webViewSource: WebViewSource;
  handleLoadEnd: () => void;
  handleError: () => void;
  handleWebViewMessage?: (event: any) => void;
  onAcceptTos?: () => void;
  onExit?: () => void;
} & Pick<ViewProps, "testID">;

const TosWebviewComponent: React.FunctionComponent<Props> = (props: Props) => (
  <>
    <View style={{ flex: 1 }}>
      <WebView
        androidCameraAccessDisabled={true}
        androidMicrophoneAccessDisabled={true}
        textZoom={100}
        style={{ flex: 1 }}
        onLoadEnd={props.handleLoadEnd}
        onError={props.handleError}
        source={props.webViewSource}
        onMessage={props.handleWebViewMessage}
        injectedJavaScript={closeInjectedScript(
          AVOID_ZOOM_JS + NOTIFY_LINK_CLICK_SCRIPT
        )}
      />
    </View>
    {props.shouldFooterRender && (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={{
          block: true,
          bordered: true,
          onPress: props.onExit,
          title: I18n.t("global.buttons.exit")
        }}
        rightButton={{
          block: true,
          primary: true,
          onPress: props.onAcceptTos,
          title: I18n.t("onboarding.tos.accept")
        }}
      />
    )}
  </>
);

export default React.memo(TosWebviewComponent);
