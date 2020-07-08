import { View } from "native-base";
import * as React from "react";
import { Alert, NativeScrollEvent } from "react-native";
import WebView from "react-native-webview";
import I18n from "../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import FooterWithButtons from "./ui/FooterWithButtons";

type Props = {
  shouldFooterRender: boolean;
  url: string;
  handleLoadEnd: () => void;
  handleError: () => void;
  handleWebViewMessage: (event: any) => void;
  onAcceptTos: () => void;
  onExit: () => void;
};

const scrollEndTolerance = 600;

const TosWebviewComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [scrollEnd, setScrollEnd] = React.useState(false);

  const handleScroll = (event: any) => {
    if (event === undefined || event === null) {
      return;
    }
    const scrollEvent = event.nativeEvent as NativeScrollEvent;
    if (!scrollEnd && scrollEvent && scrollEvent.contentSize.height > 0) {
      const scrollEnded =
        scrollEvent.contentOffset &&
        scrollEvent.contentSize &&
        scrollEvent.contentOffset.y > 0 &&
        scrollEvent.contentSize.height - scrollEvent.contentOffset.y <
          scrollEndTolerance;
      setScrollEnd(scrollEnded);
      return;
    }
  };

  const onContinue = () => {
    scrollEnd
      ? props.onAcceptTos()
      : Alert.alert(
          I18n.t("onboarding.tos.alert.title"),
          I18n.t("onboarding.tos.alert.message"),
          [
            {
              text: I18n.t("global.buttons.cancel"),
              style: "cancel"
            }
          ]
        );
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <WebView
          textZoom={100}
          style={{ flex: 1 }}
          onLoadEnd={props.handleLoadEnd}
          onScroll={handleScroll}
          onError={props.handleError}
          source={{ uri: props.url }}
          onMessage={props.handleWebViewMessage}
          injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
        />
      </View>
      {props.shouldFooterRender && (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            block: true,
            light: true,
            bordered: true,
            onPress: props.onExit,
            title: I18n.t("global.buttons.exit")
          }}
          rightButton={{
            block: true,
            primary: scrollEnd,
            gray: !scrollEnd,
            onPress: onContinue,
            title: I18n.t("onboarding.tos.accept")
          }}
        />
      )}
    </>
  );
};

export default React.memo(TosWebviewComponent);
