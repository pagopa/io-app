import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import WebviewComponent from "../../../../../components/WebviewComponent";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { CgnDetailsParamsList } from "../../navigation/params";

export type CgnMerchantLandingWebviewNavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = IOStackNavigationRouteProps<
  CgnDetailsParamsList,
  "CGN_MERCHANTS_LANDING_WEBVIEW"
>;

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const landingPageUrl = props.route.params.landingPageUrl;
  const landingPageReferrer = props.route.params.landingPageReferrer;

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <WebviewComponent
          source={{
            uri: landingPageUrl as string,
            headers: {
              referer: landingPageReferrer
            }
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantLandingWebview;
