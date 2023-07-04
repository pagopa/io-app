import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Alert } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import I18n from "../../../i18n";
import { WebviewMessage } from "../../../types/WebviewMessage";
import { getRemoteLocale } from "../../../utils/messages";
import { showToast } from "../../../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../../utils/webview";
import WebviewErrorComponent from "./WebviewErrorComponent";

type Props = {
  uri: string;
  fimsDomain?: string;
  onWebviewClose: () => void;
  onTitle: (title: string) => void;
};

const injectedJavascript = closeInjectedScript(
  AVOID_ZOOM_JS + APP_EVENT_HANDLER
);

const FimsWebView = ({ uri, fimsDomain, onWebviewClose, onTitle }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const ref = React.createRef<WebView>();

  const urlParsed = new URLParse(uri, true);

  const onWebviewError = (_: WebViewErrorEvent) => {
    setHasError(true);
    setLoading(false);
  };

  const onWebviewHttpError = (e: WebViewHttpErrorEvent) => {
    if (
      fimsDomain &&
      e.nativeEvent.url.indexOf(fimsDomain) !== -1 &&
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

    pipe(
      JSON.parse(event.nativeEvent.data),
      WebviewMessage.decode,
      E.fold(
        () => {
          showToast(I18n.t("webView.error.convertMessage"));
        },
        message => {
          const locale = getRemoteLocale();

          switch (message.type) {
            case "CLOSE_MODAL":
              onWebviewClose();
              break;
            case "SHOW_ALERT":
              const value = pipe(
                message[locale],
                O.fromNullable,
                O.getOrElse(() => message.en)
              );
              Alert.alert(value.title, value.description);
              break;
            case "SHOW_TOAST":
              const { text, type, position } = pipe(
                message[locale],
                O.fromNullable,
                O.getOrElse(() => message.en)
              );
              showToast(text, type, position);
              break;
            case "SET_TITLE":
              const title = pipe(
                message[locale],
                O.fromNullable,
                O.getOrElse(() => message.en)
              );
              onTitle(title);
              break;
          }
        }
      )
    );
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
      {hasError ? (
        <WebviewErrorComponent
          handleReload={handleReload}
          onWebviewClose={onWebviewClose}
        />
      ) : (
        <WebView
          style={IOStyles.flex}
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          ref={ref}
          source={{ uri }}
          textZoom={100}
          onLoadEnd={injectJS}
          onMessage={handleWebviewMessage}
          onError={onWebviewError}
          onHttpError={onWebviewHttpError}
          onLoadStart={() => setLoading(true)}
          sharedCookiesEnabled={true}
        />
      )}
    </LoadingSpinnerOverlay>
  );
};

export default FimsWebView;
