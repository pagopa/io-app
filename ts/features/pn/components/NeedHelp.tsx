import { View } from "react-native";
import {
  Body,
  IOButton,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { useIOSelector } from "../../../store/hooks";
import { sendCustomServiceCenterUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
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
          variant="link"
          testID="needHelp-bottomsheet-action"
        />
      </View>
    ),
    title: I18n.t("features.pn.details.help.bottomSheet.title"),
    footer: <View />
  });

  return (
    <>
      <ListItemAction
        icon="message"
        label={I18n.t("features.pn.details.help.needHelp")}
        onPress={present}
        variant="primary"
        testID="needHelp-listitem"
      />
      {bottomSheet}
    </>
  );
};
