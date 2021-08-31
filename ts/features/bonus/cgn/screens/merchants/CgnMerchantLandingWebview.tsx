import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import WebviewComponent from "../../../../../components/WebviewComponent";

type NavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const landingPageUrl = props.navigation.getParam("landingPageUrl");
  const landingPageReferrer = props.navigation.getParam("landingPageReferrer");

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
