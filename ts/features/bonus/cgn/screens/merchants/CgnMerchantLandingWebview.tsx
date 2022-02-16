import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { Body, Container, Right } from "native-base";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import WebviewComponent from "../../../../../components/WebviewComponent";
import AppHeader from "../../../../../components/ui/AppHeader";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import IconFont from "../../../../../components/ui/IconFont";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";

type NavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const navigation = useNavigationContext();
  const landingPageUrl = props.navigation.getParam("landingPageUrl");
  const landingPageReferrer = props.navigation.getParam("landingPageReferrer");

  return (
    <Container>
      <AppHeader noLeft={true}>
        <Body />
        <Right>
          <ButtonDefaultOpacity
            onPress={() => navigation.goBack()}
            transparent={true}
          >
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
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
    </Container>
  );
};

export default CgnMerchantLandingWebview;
