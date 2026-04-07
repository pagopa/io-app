import {
  BodySmall,
  ContentWrapper,
  H3,
  IOButton,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import IOMarkdown from "../../components/IOMarkdown";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { continueWithRootOrJailbreak } from "../../store/actions/persistedPreferences";
import { useIOBottomSheetModal } from "../../utils/hooks/bottomSheet";
import { trackLoginRootedScreen } from "./analytics";

const RootedDeviceModal = () => {
  trackLoginRootedScreen();

  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const handleContinueWithRootOrJailbreak = useCallback(() => {
    dispatch(continueWithRootOrJailbreak(true));
    navigation.goBack();
  }, [dispatch, navigation]);

  const body = Platform.select({
    ios: I18n.t("rooted.bodyiOS"),
    default: I18n.t("rooted.bodyAndroid")
  });

  const {
    present: presentLearnMoreBottomSheet,
    bottomSheet: learnMoreBottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t("rooted.learnMoreBottomsheet.title"),
    component: <IOMarkdown content={body} />
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <ContentWrapper>
          <View style={{ alignItems: "center" }}>
            <Pictogram name="attention" size={120} />
          </View>
          <VSpacer size={24} />
          <View accessible style={{ alignItems: "center" }}>
            <H3 style={{ textAlign: "center" }}>{I18n.t("rooted.title")}</H3>
          </View>
          <VSpacer size={8} />
          <View accessible style={{ alignItems: "center" }}>
            <BodySmall
              color="grey-650"
              style={{ textAlign: "center" }}
              weight="Regular"
            >
              {I18n.t("rooted.body")}
            </BodySmall>
          </View>
          <VSpacer size={24} />
          <View style={{ alignSelf: "center" }}>
            <IOButton
              label={I18n.t("rooted.learnMoreButton.title")}
              onPress={presentLearnMoreBottomSheet}
              variant="link"
            />
          </View>
          <VSpacer size={24} />
          <View style={{ alignSelf: "center" }}>
            <IOButton
              color="danger"
              label={I18n.t("global.buttons.continue")}
              onPress={handleContinueWithRootOrJailbreak}
              variant="solid"
            />
          </View>
        </ContentWrapper>
      </ScrollView>
      {learnMoreBottomSheet}
    </SafeAreaView>
  );
};

export default RootedDeviceModal;

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1
  }
});
