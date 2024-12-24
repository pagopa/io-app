import {
  Alert,
  Body,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { Platform, View } from "react-native";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector
} from "../../store/reducers/cie";
import { setAccessibilityFocus } from "../../utils/accessibility";

const CieNotSupported = () => {
  const hasApiLevelSupport = useIOSelector(hasApiLevelSupportSelector);
  const hasCieApiLevelSupport = pot.getOrElse(hasApiLevelSupport, false);
  const hasNFCFeature = useIOSelector(hasNFCFeatureSelector);
  const hasCieNFCFeature = pot.getOrElse(hasNFCFeature, false);
  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const navigation = useNavigation();

  useFocusEffect(() => setAccessibilityFocus(accessibilityFirstFocuseViewRef));

  return (
    <GradientScrollView
      testID="container-test"
      primaryActionProps={{
        label: I18n.t("authentication.landing.cie_unsupported.button"),
        accessibilityLabel: I18n.t(
          "authentication.landing.cie_unsupported.button"
        ),
        onPress: () => navigation.goBack(),
        testID: "close-button"
      }}
    >
      <ContentWrapper>
        <View style={IOStyles.selfCenter} testID="pictogram-test">
          <Pictogram name="updateOS" size={120} />
        </View>
        <VSpacer size={24} />
        <View accessible={true} ref={accessibilityFirstFocuseViewRef}>
          <H3
            accessible={true}
            style={{ textAlign: "center", alignItems: "center" }}
            testID="title-test"
          >
            {I18n.t("authentication.landing.cie_unsupported.title")}
          </H3>
        </View>
        <VSpacer size={24} />
        <Body style={{ textAlign: "center", alignSelf: "center" }}>
          {I18n.t("authentication.landing.cie_unsupported.body")}
        </Body>
        <VSpacer size={24} />
        <FeatureInfo
          iconName="contactless"
          body={I18n.t("authentication.landing.cie_unsupported.nfc_problem")}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="history"
          body={I18n.t("authentication.landing.cie_unsupported.os_problem")}
        />
        <VSpacer size={24} />
        {Platform.OS === "android" && !hasCieNFCFeature ? (
          <Alert
            content={I18n.t("authentication.landing.cie_unsupported.nfc_alert")}
            variant="warning"
          />
        ) : (
          Platform.OS === "android" &&
          hasCieApiLevelSupport && (
            <Alert
              content={I18n.t(
                "authentication.landing.cie_unsupported.os_alert"
              )}
              variant="warning"
            />
          )
        )}
      </ContentWrapper>
    </GradientScrollView>
  );
};

export default CieNotSupported;
