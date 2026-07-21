import { IOMarkdownLite } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";

import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
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
    component: <IOMarkdownLite content={body} />
  });

  return (
    <OperationResultScreenContent
      action={{
        color: "danger",
        label: I18n.t("global.buttons.continue"),
        onPress: handleContinueWithRootOrJailbreak
      }}
      pictogram="attention"
      secondaryAction={{
        label: I18n.t("rooted.learnMoreButton.title"),
        onPress: presentLearnMoreBottomSheet
      }}
      subtitle={I18n.t("rooted.body")}
      title={I18n.t("rooted.title")}
    >
      {learnMoreBottomSheet}
    </OperationResultScreenContent>
  );
};

export default RootedDeviceModal;
