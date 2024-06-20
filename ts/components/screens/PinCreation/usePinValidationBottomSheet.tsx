import { VSpacer, Body } from "@pagopa/io-app-design-system";
import React, { memo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { BulletList } from "../../BulletList";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";

const BottomSheetContent = memo(() => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Body>{I18n.t("onboarding.pin.policy.description")}</Body>
      <VSpacer size={16} />
      <BulletList
        title={I18n.t("onboarding.pin.policy.bulletListTitle")}
        list={[
          {
            value: I18n.t("onboarding.pin.policy.firstItem"),
            id: "first_item"
          },
          {
            value: I18n.t("onboarding.pin.policy.secondItem"),
            id: "second_item"
          }
        ]}
        spacing={16}
      />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
});

export default () =>
  useIOBottomSheetAutoresizableModal({
    title: I18n.t("onboarding.pin.policy.title"),
    component: <BottomSheetContent />
  });
