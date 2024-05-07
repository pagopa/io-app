import {
  ButtonLink,
  ButtonOutline,
  ContentWrapper,
  H3,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import LegacyMarkdown from "../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { continueWithRootOrJailbreak } from "../../store/actions/persistedPreferences";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { trackLoginRootedScreen } from "./analytics";

const RootedDeviceModal = () => {
  trackLoginRootedScreen();

  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const handleContinueWithRootOrJailbreak = React.useCallback(() => {
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
  } = useIOBottomSheetAutoresizableModal({
    title: I18n.t("rooted.learnMoreBottomsheet.title"),
    component: <LegacyMarkdown>{body}</LegacyMarkdown>
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
            <LabelSmall
              style={styles.textCenter}
              color="grey-650"
              weight="Regular"
            >
              {I18n.t("rooted.body")}
            </LabelSmall>
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
            <ButtonOutline
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
