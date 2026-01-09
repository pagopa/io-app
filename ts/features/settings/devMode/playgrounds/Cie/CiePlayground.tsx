import {
  IOButton,
  ListItemHeader,
  OTPInput
} from "@pagopa/io-app-design-system";
import { CieManager, NfcEvent } from "@pagopa/io-react-native-cie";
import { useHeaderHeight } from "@react-navigation/elements";
import { createRef, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewNavigation } from "react-native-webview";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../../hooks/useScreenEndMargin";
import { ReadStatusComponent } from "./components/ReadStatusComponent";
import { ReadStatus } from "./types/ReadStatus";

const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

type CiewWebViewProps = {
  uri: string;
  onAuthUrlChange: (url: string) => void;
};

const AuthenticationUrlWebView = ({
  uri,
  onAuthUrlChange
}: CiewWebViewProps) => {
  const webView = createRef<WebView>();
  const [authUrl, setAuthUrl] = useState<string>();

  useEffect(() => {
    if (authUrl) {
      onAuthUrlChange(authUrl);
    }
  }, [authUrl, onAuthUrlChange]);

  return (
    <WebView
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      onShouldStartLoadWithRequest={({ url }: WebViewNavigation) => {
        if (authUrl) {
          return false;
        }

        // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
        if (
          url !== undefined &&
          Platform.OS === "ios" &&
          url.indexOf("authnRequestString") !== -1
        ) {
          // avoid redirect and follow the 'happy path'
          if (webView.current !== null) {
            setAuthUrl(url);
          }
          return false;
        }

        // Once the returned url contains the "OpenApp" string, then the authorization has been given
        if (url && url.indexOf("OpenApp") !== -1) {
          setAuthUrl(url);
          return false;
        }

        return true;
      }}
      source={{ uri }}
    />
  );
};

export const CiePlayground = () => {
  const [authUrl, setAuthUrl] = useState<string>();
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [event, setEvent] = useState<NfcEvent>();

  const headerHeight = useHeaderHeight();
  const { screenEndMargin } = useScreenEndMargin();

  useHeaderSecondLevel({
    title: "CIE Playground"
  });

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", e => {
        setEvent(e);
        CieManager.setCurrentAlertMessage(
          `Reading in progress\n ${getProgressEmojis(e.progress)}`
        );
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setStatus("error");
        setEvent(undefined);
        Alert.alert("Error", JSON.stringify(error, undefined, 2));
      }),
      // Start listening for success
      CieManager.addListener("onSuccess", uri => {
        setStatus("success");
        setAuthenticatedUrl(uri);
      })
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, []);

  useEffect(() => {
    Alert.alert(
      "Warning",
      "Completing authentication through this playground will log you out of the IO app.",
      [
        {
          text: "I understand",
          style: "cancel"
        }
      ]
    );
  }, []);

  if (!authUrl) {
    return (
      <LoadingSpinnerOverlay isLoading={true} loadingOpacity={1}>
        <AuthenticationUrlWebView
          uri={
            "https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL3"
          }
          onAuthUrlChange={setAuthUrl}
        />
      </LoadingSpinnerOverlay>
    );
  }

  if (authenticatedUrl) {
    return <WebView source={{ uri: authenticatedUrl }} />;
  }

  const handleStartReading = async () => {
    if (authUrl === undefined) {
      return;
    }

    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startReading(code, authUrl);
    } catch (e) {
      Alert.alert("Unable to read CIE", JSON.stringify(e, undefined, 2));
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setStatus("idle");
    void CieManager.stopReading();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({
        ios: "padding",
        android: undefined
      })}
      contentContainerStyle={{
        flex: 1,
        paddingBottom: 100 + screenEndMargin
      }}
      keyboardVerticalOffset={headerHeight}
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <View>
          <ListItemHeader label="Insert card PIN" />
          <OTPInput secret value={code} length={8} onValueChange={setCode} />
        </View>
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop reading" : "Start reading"}
          disabled={code.length !== 8}
          onPress={() =>
            status === "reading" ? handleStopReading() : handleStartReading()
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const getProgressEmojis = (progress: number) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const totalDots = 10; // Length of the progress bar
  const blueDots = Math.round(clampedProgress * totalDots);
  const whiteDots = totalDots - blueDots;

  return "🔵".repeat(blueDots) + "⚪".repeat(whiteDots);
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1
  },
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
