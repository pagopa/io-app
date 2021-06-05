import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { cancelButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

type NavigationParams = Readonly<{
  markdownDetails: string;
}>;

export const EuCovidCertMarkdownDetailsScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => (
  <BaseScreenComponent goBack={true}>
    <SafeAreaView style={IOStyles.flex} testID={"EuCovidCertQrCodeFullScreen"}>
      <ScrollView>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
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
