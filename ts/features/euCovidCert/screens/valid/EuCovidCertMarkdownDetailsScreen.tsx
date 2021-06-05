import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";

type NavigationParams = Readonly<{
  markdownDetails: string;
}>;

export const EuCovidCertMarkdownDetailsScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t(
      "features.euCovidCertificate.valid.markdownDetails.headerTitle"
    )}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex} testID={"EuCovidCertQrCodeFullScreen"}>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        <MarkdownHandleCustomLink>
          {props.navigation.getParam("markdownDetails")}
        </MarkdownHandleCustomLink>
      </ScrollView>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(
          () => props.navigation.goBack(),
          I18n.t("global.buttons.close")
        )}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);
