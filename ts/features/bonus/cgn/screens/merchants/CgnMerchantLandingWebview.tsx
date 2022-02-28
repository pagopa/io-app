import { CompatNavigationProp } from "@react-navigation/compat/src/types";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import WebviewComponent from "../../../../../components/WebviewComponent";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { CgnDetailsParamsList } from "../../navigation/params";

export type CgnMerchantLandingWebviewNavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_LANDING_WEBVIEW">
  >;
};

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const navigation = useNavigation();
  const landingPageUrl = props.navigation.getParam("landingPageUrl");
  const landingPageReferrer = props.navigation.getParam("landingPageReferrer");

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
              referer: landingPageReferrer,
              "X-PagoPa-CGN-Referer": landingPageReferrer
            }
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantLandingWebview;
