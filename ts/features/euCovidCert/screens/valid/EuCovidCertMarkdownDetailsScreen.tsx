import { View } from "native-base";
import { useState } from "react";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../components/core/typography/Label";
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

const styles = StyleSheet.create({
  save: {
    width: "100%"
  }
});

export const EuCovidCertMarkdownDetailsScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => {
  const [loadComplete, setLoadComplete] = useState(false);
  const activateCTA = () => setLoadComplete(true);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.euCovidCertificate.valid.markdownDetails.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"EuCovidCertQrCodeFullScreen"}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <MarkdownHandleCustomLink onLoadEnd={activateCTA}>
            {props.navigation.getParam("markdownDetails")}
          </MarkdownHandleCustomLink>
          {loadComplete && (
            <>
              <ButtonDefaultOpacity style={styles.save}>
                <Label color={"white"}>
                  {I18n.t(
                    "features.euCovidCertificate.valid.markdownDetails.save"
                  )}
                </Label>
              </ButtonDefaultOpacity>
              <View spacer={true} />
            </>
          )}
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
};
