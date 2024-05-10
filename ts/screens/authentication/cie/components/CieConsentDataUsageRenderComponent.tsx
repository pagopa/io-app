import React, { ElementType } from "react";
import WebView, { WebViewNavigation } from "react-native-webview";
import { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import UnlockAccessScreen from "../../../onboarding/UnlockAccessScreen";
import AuthErrorScreen from "./AuthErrorScreen";

type ContentComponentProps = {
  isLoginSuccess?: boolean;
  LoaderComponent: ElementType;
  hasError: boolean;
  errorCode?: string;
  cieConsentUri: string;
  originSchemasWhiteList: Array<string>;
  handleShouldStartLoading: (event: WebViewNavigation) => boolean;
  handleWebViewError: () => void;
  handleHttpError: (event: WebViewHttpErrorEvent) => void;
  onRetry: () => void;
  onCancel: () => void;
};

const CieConsentDataUsageRenderComponent = ({
  isLoginSuccess,
  LoaderComponent,
  hasError,
  errorCode,
  cieConsentUri,
  originSchemasWhiteList,
  handleShouldStartLoading,
  handleWebViewError,
  handleHttpError,
  onRetry,
  onCancel
}: ContentComponentProps) => {
  if (isLoginSuccess) {
    return <LoaderComponent />;
  }
  if (hasError) {
    if (errorCode === "1002") {
      return <UnlockAccessScreen identifier="CIE" />;
    } else {
      return (
        <AuthErrorScreen
          errorCode={errorCode}
          onRetry={onRetry}
          onCancel={onCancel}
        />
      );
    }
  } else {
    return (
      <WebView
        androidCameraAccessDisabled={true}
        androidMicrophoneAccessDisabled={true}
        textZoom={100}
        originWhitelist={originSchemasWhiteList}
        source={{ uri: decodeURIComponent(cieConsentUri) }}
        javaScriptEnabled={true}
        onShouldStartLoadWithRequest={handleShouldStartLoading}
        renderLoading={() => <LoaderComponent />}
        onError={handleWebViewError}
        onHttpError={handleHttpError}
      />
    );
  }
};
export default CieConsentDataUsageRenderComponent;
