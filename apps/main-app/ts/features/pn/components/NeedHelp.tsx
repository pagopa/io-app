import { Body, IOButton, ListItemAction, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIOSelector } from "../../../store/hooks";
import { sendCustomServiceCenterUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";

export const NeedHelp = () => {
  const customerServiceCenterUrl = useIOSelector(
    sendCustomServiceCenterUrlSelector
  );
  const openCustomerServiceCenterUrl = () => {
    openWebUrl(customerServiceCenterUrl);
  };
  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <View>
        <Body>{I18n.t("features.pn.details.help.bottomSheet.content")}</Body>
        <VSpacer size={16} />
        <IOButton
          icon="website"
          label={I18n.t("features.pn.details.help.bottomSheet.action")}
          onPress={openCustomerServiceCenterUrl}
          testID="needHelp-bottomsheet-action"
          variant="link"
        />
        <VSpacer size={32} />
      </View>
    ),
    title: I18n.t("features.pn.details.help.bottomSheet.title")
  });

  return (
    <>
      <ListItemAction
        icon="message"
        label={I18n.t("features.pn.details.help.needHelp")}
        onPress={present}
        testID="needHelp-listitem"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
