import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Alert, Image, StyleSheet, ScrollView } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import {
  FooterWithButtons,
  HeaderSecondLevel,
  IOColors,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import brokenLinkImage from "../../img/broken-link.png";
import I18n from "../i18n";
import { WebviewMessage } from "../types/WebviewMessage";
import { getRemoteLocale } from "../features/messages/utils/messages";
import { showToast } from "../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../utils/webview";
import { Label } from "./core/typography/Label";
import { withLightModalContext } from "./helpers/withLightModalContext";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { LightModalContextInterface } from "./ui/LightModal";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  onWebviewClose: () => void;
  uri: string;
  handleWebMessage?: (message: string) => void;
} & LightModalContextInterface;

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
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
    <View style={[{ backgroundColor: IOColors.white }, IOStyles.flex]}>
      <HeaderSecondLevel
        title=""
        type="singleAction"
        firstAction={{
          icon: "closeLarge",
          onPress: close,
          accessibilityLabel: I18n.t("global.buttons.close"),
          testID: "contextualInfo_closeButton"
        }}
      />
      <ScrollView style={IOStyles.flex}>
        <View style={IOStyles.selfCenter}>
          <Icon name="ok" size={96} color="aqua" />
        </View>
        <VSpacer size={24} />

        <View style={styles.itemsCenter}>
          <Label>{`${I18n.t("global.genericThanks")},`}</Label>
          <Label weight={"Bold"}>{text}</Label>
        </View>
      </ScrollView>
    </View>
  );

  const showErrorContent = (text: string, close: () => void) => (
    <View style={[{ backgroundColor: IOColors.white }, IOStyles.flex]}>
      <HeaderSecondLevel
        title=""
        type="singleAction"
        firstAction={{
          icon: "closeLarge",
          onPress: close,
          accessibilityLabel: I18n.t("global.buttons.close"),
          testID: "contextualInfo_closeButton"
        }}
      />
      <ScrollView style={IOStyles.flex}>
        <View style={IOStyles.selfCenter}>
          <Icon name="errorFilled" size={96} color="red" />
        </View>
        <VSpacer size={16} />
        <View style={styles.itemsCenter}>
          <Label weight={"Bold"}>{text}</Label>
        </View>
      </ScrollView>
    </View>
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
    <>
      <View style={styles.errorContainer}>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Image source={brokenLinkImage} resizeMode="contain" />
        <Label style={styles.errorTitle} weight={"Bold"}>
          {I18n.t("authentication.errors.network.title")}
        </Label>
      </View>
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: props.onWebviewClose
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.retry"),
            accessibilityLabel: I18n.t("global.buttons.retry"),
            onPress: handleReload
          }
        }}
      />
    </>
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
