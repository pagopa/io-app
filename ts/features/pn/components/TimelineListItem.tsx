import React from "react";
import { View } from "react-native";
import { ListItemAction } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";

type TimelineListItemProps = {};

export const TimelineListItem = (props: TimelineListItemProps) => {
  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal(
    {
      component: <></>,
      title: I18n.t("features.pn.details.timeline.menuTitle"),
      footer: <View />
    },
    100
  );

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("features.pn.details.timeline.menuTitle")}
        icon="reload"
        label={I18n.t("features.pn.details.timeline.menuTitle")}
        onPress={present}
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
