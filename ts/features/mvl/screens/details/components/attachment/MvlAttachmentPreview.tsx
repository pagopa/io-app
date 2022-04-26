import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Pdf from "react-native-pdf";
import { NavigationStackScreenProps } from "react-navigation-stack";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../../i18n";
import customVariables from "../../../../../../theme/variables";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { isIos } from "../../../../../../utils/platform";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pdf: {
    flex: 1,
    backgroundColor: customVariables.brandDarkGray
  }
});

const renderFooter = () =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {},
      I18n.t("features.mvl.details.attachments.pdfPreview.singleBtn"))}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={confirmButtonProps(() => {}, I18n.t("global.buttons.share"))}
      midButton={confirmButtonProps(() => {},
      I18n.t("features.mvl.details.attachments.pdfPreview.save"))}
      rightButton={confirmButtonProps(() => {},
      I18n.t("features.mvl.details.attachments.pdfPreview.open"))}
    />
  );

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  path: string;
}>;

export const MvlAttachmentPreview = (
  props: NavigationStackScreenProps<MvlAttachmentPreviewNavigationParams>
): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    contextualHelp={emptyContextualHelp}
    headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
  >
    <SafeAreaView style={styles.container} testID={"MvlDetailsScreen"}>
      <Pdf
        source={{ uri: props.navigation.getParam("path"), cache: true }}
        style={styles.pdf}
      />
      {renderFooter()}
    </SafeAreaView>
  </BaseScreenComponent>
);
