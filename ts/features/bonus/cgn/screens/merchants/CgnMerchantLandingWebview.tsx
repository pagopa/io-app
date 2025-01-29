import { Route, useRoute } from "@react-navigation/core";

import { FunctionComponent } from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import WebviewComponent from "../../../../../components/WebviewComponent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { CgnDetailsParamsList } from "../../navigation/params";

export type CgnMerchantLandingWebviewNavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = {
  navigation: IOStackNavigationProp<
    CgnDetailsParamsList,
    "CGN_MERCHANTS_LANDING_WEBVIEW"
  >;
};

const CgnMerchantLandingWebview: FunctionComponent<Props> = () => {
  const route =
    useRoute<
      Route<
        "CGN_MERCHANTS_LANDING_WEBVIEW",
        CgnMerchantLandingWebviewNavigationParams
      >
    >();

  const landingPageUrl = route.params.landingPageUrl;
  const landingPageReferrer = route.params.landingPageReferrer;

  useHeaderSecondLevel({
    title: "",
    canGoBack: true
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <WebviewComponent
        source={{
          uri: landingPageUrl as string,
          headers: {
            referer: landingPageReferrer,
            "X-PagoPa-CGN-Referer": landingPageReferrer
          }
        }}
      />
    </SafeAreaView>
  );
};

export default CgnMerchantLandingWebview;
