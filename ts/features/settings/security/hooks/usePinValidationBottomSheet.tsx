import { IOMarkdown, VSpacer } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

const BottomSheetContent = memo(() => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <IOMarkdown content={I18n.t("onboarding.pin.policy.body")} />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
});

export default () =>
  useIOBottomSheetModal({
    title: I18n.t("onboarding.pin.policy.title"),
    component: <BottomSheetContent />
  });
