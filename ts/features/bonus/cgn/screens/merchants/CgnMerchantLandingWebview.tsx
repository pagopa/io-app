import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import WebView from "react-native-webview";
import { useState } from "react";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";

type NavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const landingPageUrl = props.navigation.getParam("landingPageUrl");
  const landingPageReferrer = props.navigation.getParam("landingPageReferrer");

  const ref = React.createRef<WebView>();

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    if (ref.current) {
      ref.current.reload();
    }
  };

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        {hasError ? (
          <GenericErrorComponent onRetry={handleReload} />
        ) : (
          <LoadingSpinnerOverlay isLoading={loading}>
            <WebView
              style={IOStyles.flex}
              ref={ref}
              onLoadEnd={() => setLoading(false)}
              onError={() => setHasError(true)}
              source={{
                uri: landingPageUrl as string,
                headers: {
                  referer: landingPageReferrer
                }
              }}
            />
          </LoadingSpinnerOverlay>
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantLandingWebview;
