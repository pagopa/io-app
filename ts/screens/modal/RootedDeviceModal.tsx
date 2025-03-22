import {
  BodySmall,
  ButtonLink,
  ContentWrapper,
  H3,
  Pictogram,
  VSpacer,
  ButtonSolid
} from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import IOMarkdown from "../../components/IOMarkdown";
import I18n from "../../i18n";
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
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <ContentWrapper>
          <View style={IOStyles.alignCenter}>
            <Pictogram name="attention" size={120} />
          </View>
          <VSpacer size={24} />
          <View accessible style={IOStyles.alignCenter}>
            <H3 style={styles.textCenter}>{I18n.t("rooted.title")}</H3>
          </View>
          <VSpacer size={8} />
          <View accessible style={IOStyles.alignCenter}>
            <BodySmall
              style={styles.textCenter}
              color="grey-650"
              weight="Regular"
            >
              {I18n.t("rooted.body")}
            </BodySmall>
          </View>
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <ButtonLink
              label={I18n.t("rooted.learnMoreButton.title")}
              accessibilityLabel={I18n.t("rooted.learnMoreButton.title")}
              onPress={presentLearnMoreBottomSheet}
            />
          </View>
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <ButtonSolid
              color="danger"
              label={I18n.t("global.buttons.continue")}
              accessibilityLabel={I18n.t("global.buttons.continue")}
              onPress={handleContinueWithRootOrJailbreak}
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
  flex: {
    flex: 1
  },
  textCenter: {
    textAlign: "center"
  },
  scrollViewContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1
  }
});
