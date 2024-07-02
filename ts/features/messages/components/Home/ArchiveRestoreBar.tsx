import React, { useEffect } from "react";
import { constUndefined } from "fp-ts/lib/function";
import { View } from "react-native";
import {
  ButtonOutline,
  ButtonSolid,
  IOStyles
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { showArchiveRestoreBarSelector } from "../../store/reducers/archiving";
import { useIOTabNavigation } from "../../../../navigation/params/AppParamsList";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import I18n from "../../../../i18n";
import { cancelMessageArchivingScheduleAction } from "../../store/actions/archiving";

export const ArchiveRestoreBar = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const tabNavigation = useIOTabNavigation();
  const dispatch = useIODispatch();

  const showArchiveRestoreBar = useIOSelector(showArchiveRestoreBarSelector);
  const shownCategory = useIOSelector(shownMessageCategorySelector);
  console.log(`=== ArchiveRestoreBar ${shownCategory}`);

  useEffect(() => {
    // TODO would be nice not to raise this event if the bar is already hidden/shown
    console.log(`=== ArchiveRestoreBar useEffect`);
    tabNavigation.setOptions({
      tabBarStyle: {
        display: showArchiveRestoreBar ? "none" : "flex"
      }
    });
  }, [showArchiveRestoreBar, tabNavigation]);

  if (!showArchiveRestoreBar) {
    return null;
  }

  const rightButtonLabel = I18n.t(
    `messages.cta.${shownCategory === "ARCHIVE" ? "unarchive" : "archive"}`
  );
  return (
    <View
      style={{
        flexDirection: "row",
        paddingBottom: 8 + safeAreaInsets.bottom,
        paddingHorizontal: 24,
        paddingTop: 8
      }}
    >
      <View style={[IOStyles.flex, { marginEnd: 4 }]}>
        <ButtonOutline
          label="Annulla"
          fullWidth
          onPress={() => dispatch(cancelMessageArchivingScheduleAction())}
        />
      </View>
      <View style={[IOStyles.flex, { marginStart: 4 }]}>
        <ButtonSolid
          label={rightButtonLabel}
          fullWidth
          onPress={constUndefined}
        />
      </View>
    </View>
  );
};
