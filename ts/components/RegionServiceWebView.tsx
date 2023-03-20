import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Body, Container, Content, Right } from "native-base";
import * as React from "react";
import { View, Alert, Image, StyleSheet } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import brokenLinkImage from "../../img/broken-link.png";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { WebviewMessage } from "../types/WebviewMessage";
import { getRemoteLocale } from "../utils/messages";
import { showToast } from "../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../utils/webview";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { VSpacer } from "./core/spacer/Spacer";
import { Body as BodyText } from "./core/typography/Body";
import { Label } from "./core/typography/Label";
import { withLightModalContext } from "./helpers/withLightModalContext";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import AppHeader from "./ui/AppHeader";
import IconFont from "./ui/IconFont";
import { LightModalContextInterface } from "./ui/LightModal";

type Props = {
  onWebviewClose: () => void;
  uri: string;
  handleWebMessage?: (message: string) => void;
} & LightModalContextInterface;

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  selfCenter: { alignSelf: "center" },
  flex1: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 0,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  }
});

const injectedJavascript = closeInjectedScript(
  AVOID_ZOOM_JS + APP_EVENT_HANDLER
);

const RegionServiceWebView: React.FunctionComponent<Props> = (props: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const ref = React.createRef<WebView>();

  const urlParsed = new URLParse(props.uri, true);

  const showSuccessContent = (text: string, close: () => void) => (
    <Container>
      <AppHeader noLeft={true}>
        <Body />
        <Right>
          <ButtonDefaultOpacity onPress={close} transparent={true}>
            <IconFont name={"io-close"} />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <Content style={styles.flex1}>
        <IconFont
          name={"io-complete"}
          size={120}
          color={customVariables.colorHighlight}
          style={styles.selfCenter}
        />
        <VSpacer size={24} />

        <View style={styles.itemsCenter}>
          <Label>{`${I18n.t("global.genericThanks")},`}</Label>
          <Label weight={"Bold"}>{text}</Label>
        </View>
      </Content>
    </Container>
  );

  const showErrorContent = (text: string, close: () => void) => (
    <Container>
      <AppHeader noLeft={true}>
        <Body />
        <Right>
          <ButtonDefaultOpacity onPress={close} transparent={true}>
            <IconFont name={"io-close"} />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <Content style={styles.flex1}>
        <IconFont
          name={"io-error"}
          size={120}
          color={customVariables.brandDanger}
          style={styles.selfCenter}
        />
        <VSpacer size={16} />

        <View style={styles.itemsCenter}>
          <Label weight={"Bold"}>{text}</Label>
        </View>
      </Content>
    </Container>
  );

  const onWebviewError = (_: WebViewErrorEvent) => {
    setHasError(true);
    setLoading(false);
  };

  const onWebviewHttpError = (_: WebViewHttpErrorEvent) => {
    setHasError(true);
    setLoading(false);
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <VSpacer size={40} />
      <VSpacer size={40} />
      <Image source={brokenLinkImage} resizeMode="contain" />
      <Label style={styles.errorTitle} weight={"Bold"}>
        {I18n.t("authentication.errors.network.title")}
      </Label>

      <View style={styles.errorButtonsContainer}>
        <ButtonDefaultOpacity
          onPress={props.onWebviewClose}
          style={styles.cancelButtonStyle}
          block={true}
          light={true}
          bordered={true}
        >
          <BodyText>{I18n.t("global.buttons.cancel")}</BodyText>
        </ButtonDefaultOpacity>
        <ButtonDefaultOpacity
          onPress={handleReload}
          style={{ flex: 2 }}
          block={true}
          primary={true}
        >
          <Label color={"white"}>{I18n.t("global.buttons.retry")}</Label>
        </ButtonDefaultOpacity>
      </View>
    </View>
  );

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    if (ref.current) {
      ref.current.reload();
    }
  };

  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    if (!event.nativeEvent.url.startsWith(urlParsed.origin)) {
      return;
    }

    if (props.handleWebMessage) {
      props.handleWebMessage(event.nativeEvent.data);
    }

    const maybeData = WebviewMessage.decode(JSON.parse(event.nativeEvent.data));

    if (E.isLeft(maybeData)) {
      showToast(I18n.t("webView.error.convertMessage"));
      return;
    }

    const locale = getRemoteLocale();
    const message = maybeData.right;
    switch (message.type) {
      case "CLOSE_MODAL":
        props.onWebviewClose();
        return;
      case "START_LOAD":
        setLoading(true);
        return;
      case "END_LOAD":
        setLoading(false);
        return;
      case "SHOW_SUCCESS":
        props.showModal(
          showSuccessContent(
            pipe(
              message[locale],
              O.fromNullable,
              O.getOrElse(() => message.en)
            ),
            () => {
              props.hideModal();
              props.onWebviewClose();
            }
          )
        );
        return;
      case "SHOW_ERROR":
        props.showModal(
          showErrorContent(
            pipe(
              message[locale],
              O.fromNullable,
              O.getOrElse(() => message.en)
            ),
            props.hideModal
          )
        );
        return;
      case "SHOW_ALERT":
        const value = pipe(
          message[locale],
          O.fromNullable,
          O.getOrElse(() => message.en)
        );
        Alert.alert(value.title, value.description);
        return;
      default:
        return;
    }
  };

  const injectJS = () => {
    pipe(
      ref.current,
      O.fromNullable,
      O.map(wv => wv.injectJavaScript(injectedJavascript))
    );
    setLoading(false);
  };

  return (
    <LoadingSpinnerOverlay isLoading={loading}>
      {!hasError && (
        <View style={{ flex: 1 }}>
          <WebView
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            ref={ref}
            source={{ uri: props.uri }}
            textZoom={100}
            onLoadEnd={injectJS}
            onMessage={handleWebviewMessage}
            onError={onWebviewError}
            onHttpError={onWebviewHttpError}
            onLoadStart={() => setLoading(true)}
            sharedCookiesEnabled={true}
          />
        </View>
      )}
      {hasError && renderErrorComponent()}
    </LoadingSpinnerOverlay>
  );
};

export default withLightModalContext(RegionServiceWebView);
