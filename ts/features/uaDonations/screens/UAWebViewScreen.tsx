import { FooterWithButtons, IOToast } from "@pagopa/io-app-design-system";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { constVoid } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import WebView from "react-native-webview";
import URLParse from "url-parse";
import dataErrorImage from "../../../../img/pictograms/doubt.png";
import genericErrorImage from "../../../../img/wallet/errors/generic-error-icon.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { checkoutUADonationsUrl } from "../../../urls";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { isHttp } from "../../../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";

export type UAWebviewScreenNavigationParams = Readonly<{
  urlToLoad: string;
}>;

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

type ErrorComponentProps = {
  onRetry: () => void;
  errorText: string;
  buttonTitle: string;
  image: React.ReactNode;
};
const ErrorComponent: React.FunctionComponent<ErrorComponentProps> = props => (
  <>
    <InfoScreenComponent image={props.image} title={props.errorText} />
    <FooterWithButtons
      type={"SingleButton"}
      primary={{
        type: "Solid",
        buttonProps: {
          label: props.buttonTitle,
          onPress: props.onRetry
        }
      }}
    />
  </>
);

// a loading component rendered during the webview loading states
const renderLoading = () => (
  <View style={styles.loading}>
    <RefreshIndicator />
  </View>
);

const injectedJavascript = closeInjectedScript(AVOID_ZOOM_JS);

/**
 * this screen embeds a webview that loads a uri url retrieved from internalRouteNavigation store section (urlToLoad)
 * it handles also the messages sent from the web page to trigger the payment flow
 * @constructor
 */
export const UAWebViewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route =
    useRoute<
      Route<"UADONATION_ROUTES_WEBVIEW", UAWebviewScreenNavigationParams>
    >();
  const uri = route.params.urlToLoad;
  const ref = React.createRef<WebView>();
  /**
   * errors type
   * - webview: errors coming from the webpage
   * - data: unexpected data from navigation params (empty or malformed)
   */
  const [errorType, setErrorType] = useState<"webview" | "data" | undefined>();

  useEffect(() => {
    if (Platform.OS === "ios") {
      Linking.openURL(checkoutUADonationsUrl).catch(_ =>
        IOToast.error(I18n.t("genericError"))
      );
      navigation.goBack();
    }

    if (uri === undefined) {
      setErrorType("data");
    } else {
      const urlParsed = new URLParse(uri);
      // url malformed
      if (isStringNullyOrEmpty(urlParsed.host) || !isHttp(urlParsed.origin)) {
        setErrorType("data");
      }
    }
  }, [uri, navigation]);

  // inject JS to avoid the user can zoom the web page content
  const injectJS = () => {
    ref.current?.injectJavaScript(injectedJavascript);
  };

  const onError = () => {
    setErrorType("webview");
  };

  const getErrorComponent = (error: NonNullable<typeof errorType>) => {
    switch (error) {
      case "webview":
        return (
          <ErrorComponent
            image={renderInfoRasterImage(genericErrorImage)}
            errorText={I18n.t("wallet.errors.GENERIC_ERROR")}
            buttonTitle={I18n.t("global.buttons.retry")}
            onRetry={() => {
              ref.current?.reload();
              setErrorType(undefined);
            }}
          />
        );
      case "data":
        return (
          <ErrorComponent
            image={renderInfoRasterImage(dataErrorImage)}
            buttonTitle={I18n.t(
              "features.uaDonations.webViewScreen.errors.data.buttonTitle"
            )}
            errorText={I18n.t("wallet.errors.GENERIC_ERROR")}
            onRetry={() => {
              navigation.goBack();
            }}
          />
        );
    }
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.uaDonations.webViewScreen.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex}>
        {errorType === undefined && uri && (
          <WebView
            testID={"UAWebViewScreenTestID"}
            ref={ref}
            cacheEnabled={false}
            textZoom={100}
            source={{ uri }}
            onLoadEnd={injectJS}
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            onError={onError}
            onHttpError={onError}
            onMessage={_ => constVoid}
            startInLoadingState={true}
            renderLoading={renderLoading}
            javaScriptEnabled={true}
          />
        )}
        {errorType && getErrorComponent(errorType)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
