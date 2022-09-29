import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useContext } from "react";
import { Alert } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { LightModalContext } from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import { WebviewMessage } from "../../../types/WebviewMessage";
import { getRemoteLocale } from "../../../utils/messages";
import { showToast } from "../../../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../../utils/webview";
import ErrorContent from "./ErrorContent";
import SuccessContent from "./SuccessContent";
import WebviewErrorComponent from "./WebviewErrorComponent";

type Props = {
  onWebviewClose: () => void;
  uri: string;
  fimsDomain?: string;
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

  const onWebviewHttpError = (e: WebViewHttpErrorEvent) => {
    if (
      props.fimsDomain &&
      e.nativeEvent.url.indexOf(props.fimsDomain) !== -1 &&
      e.nativeEvent.statusCode === 400
    ) {
      return;
    }

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
        showModal(
          <SuccessContent
            text={pipe(
              message[locale],
              O.fromNullable,
              O.getOrElse(() => message.en)
            )}
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
            text={pipe(
              message[locale],
              O.fromNullable,
              O.getOrElse(() => message.en)
            )}
            close={hideModal}
          />
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
