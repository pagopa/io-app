import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { useContext } from "react";
import { Alert } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import URLParse from "url-parse";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import I18n from "../../../i18n";
import { WebviewMessage } from "../../../types/WebviewMessage";
import { showToast } from "../../../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../../utils/webview";
import { getRemoteLocale } from "../../../utils/messages";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { LightModalContext } from "../../../components/ui/LightModal";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import SuccessContent from "./SuccessContent";
import ErrorContent from "./ErrorContent";
import WebviewErrorComponent from "./WebviewErrorComponent";

type Props = {
  onWebviewClose: () => void;
  uri: string;
  handleWebMessage?: (message: string) => void;
};

const injectedJavascript = closeInjectedScript(
  AVOID_ZOOM_JS + APP_EVENT_HANDLER
);

const FimsWebView = (props: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const { showModal, hideModal } = useContext(LightModalContext);

  const ref = React.createRef<WebView>();

  const urlParsed = new URLParse(props.uri, true);

  const onWebviewError = (_: WebViewErrorEvent) => {
    setHasError(true);
    setLoading(false);
  };

  const onWebviewHttpError = (_: WebViewHttpErrorEvent) => {
    setHasError(true);
    setLoading(false);
  };

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

    if (maybeData.isLeft()) {
      showToast(I18n.t("webView.error.convertMessage"));
      return;
    }

    const locale = getRemoteLocale();
    const message = maybeData.value;
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
        showModal(
          <SuccessContent
            text={fromNullable(message[locale]).getOrElse(message.en)}
            close={() => {
              hideModal();
              props.onWebviewClose();
            }}
          />
        );
        return;
      case "SHOW_ERROR":
        showModal(
          <ErrorContent
            text={fromNullable(message[locale]).getOrElse(message.en)}
            close={hideModal}
          />
        );
        return;
      case "SHOW_ALERT":
        const value = fromNullable(message[locale]).getOrElse(message.en);
        Alert.alert(value.title, value.description);
        return;
      default:
        return;
    }
  };

  const injectJS = () => {
    fromNullable(ref.current).map(wv =>
      wv.injectJavaScript(injectedJavascript)
    );
    setLoading(false);
  };

  return (
    <>
      {hasError ? (
        <WebviewErrorComponent
          handleReload={handleReload}
          onWebviewClose={props.onWebviewClose}
        />
      ) : (
        <LoadingSpinnerOverlay isLoading={loading}>
          <WebView
            style={IOStyles.flex}
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
        </LoadingSpinnerOverlay>
      )}
    </>
  );
};

export default FimsWebView;
