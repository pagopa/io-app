import {
  FooterWithButtons,
  IOStyles,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { BlockButtonProps } from "@pagopa/io-app-design-system/lib/typescript/components/layout/BlockButtons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import ItwKoView from "../../components/ItwKoView";

const ItwMissingFeatureScreen = () => {
  const { isExperimental } = useIOExperimentalDesign();
  const navigation = useNavigation();

  /**
   * Content view rendered when the experimental design is enabled.
   * Includes a centered button to go back.
   */
  const ExperimentalContentView = () => (
    <ItwKoView
      title={I18n.t("features.itWallet.missingFeatureScreen.title")}
      subtitle={I18n.t("features.itWallet.missingFeatureScreen.subtitle")}
      pictogram="empty"
      action={{
        label: I18n.t("features.itWallet.missingFeatureScreen.button.label"),
        accessibilityLabel: I18n.t(
          "features.itWallet.missingFeatureScreen.button.label"
        ),
        onPress: () => navigation.goBack()
      }}
    />
  );

  /**
   * Content view rendered when the experimental design is disabled.
   * Doesn't include a button to go back.
   */
  const LegacyContentView = () => (
    <View style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}>
      <ItwKoView
        title={I18n.t("features.itWallet.missingFeatureScreen.title")}
        subtitle={I18n.t("features.itWallet.missingFeatureScreen.subtitle")}
        pictogram="empty"
      />
    </View>
  );

  /**
   * Buttons props for the FooterWithButtons component which goes back to the previous screen.
   */
  const ButtonProps: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      label: I18n.t("features.itWallet.missingFeatureScreen.button.label"),
      accessibilityLabel: I18n.t(
        "features.itWallet.missingFeatureScreen.button.label"
      ),
      onPress: () => navigation.goBack()
    }
  };

  return isExperimental ? (
    <View style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}>
      <ExperimentalContentView />
    </View>
  ) : (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.missingFeatureScreen.headerTitle")}
    >
      <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
        <View style={{ flexGrow: 1 }}>
          <LegacyContentView />
          <FooterWithButtons primary={ButtonProps} type="SingleButton" />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwMissingFeatureScreen;
