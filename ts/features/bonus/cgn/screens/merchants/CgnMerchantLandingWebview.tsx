import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import WebviewComponent from "../../../../../components/WebviewComponent";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
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
  const navigation = useNavigation();
  const landingPageUrl = props.route.params.landingPageUrl;
  const landingPageReferrer = props.route.params.landingPageReferrer;

  return (
    <BaseScreenComponent
      customRightIcon={{
        iconName: "io-close",
        onPress: () => navigation.goBack()
      }}
    >
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
