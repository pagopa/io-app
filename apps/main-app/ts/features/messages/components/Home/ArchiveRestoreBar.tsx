import { IOButton } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBottomTabNavigatorStyle } from "../../../../hooks/useBottomTabNavigatorStyle";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIOTabNavigation } from "../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  resetMessageArchivingAction,
  startProcessingMessageArchivingAction
} from "../../store/actions/archiving";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import {
  areThereEntriesForShownMessageListCategorySelector,
  isArchivingDisabledSelector,
  isArchivingInProcessingModeSelector
} from "../../store/reducers/archiving";
import { MessageListCategory } from "../../types/messageListCategory";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 8
  },
  endButtonContainer: {
    flex: 1,
    marginStart: 4
  },
  startButtonContainer: {
    flex: 1,
    marginEnd: 4
  }
});

type ArchiveRestoreCTAsProps = {
  category: MessageListCategory;
};

export const ArchiveRestoreBar = () => {
  const store = useIOStore();
  const tabNavigation = useIOTabNavigation();

  const tabBarStyle = useBottomTabNavigatorStyle();

  const isArchivingDisabled = useIOSelector(isArchivingDisabledSelector);
  const shownCategory = useIOSelector(shownMessageCategorySelector);

  const androidBackButtonCallback = useCallback(() => {
    // Disable Android back button while processing archiving/restoring
    const state = store.getState();
    return isArchivingInProcessingModeSelector(state);
  }, [store]);
  useHardwareBackButton(androidBackButtonCallback);

  useEffect(() => {
    tabNavigation.setOptions({
      tabBarStyle: [
        tabBarStyle,
        {
          display: isArchivingDisabled ? "flex" : "none"
        }
      ]
    });
  }, [isArchivingDisabled, tabBarStyle, tabNavigation]);

  if (isArchivingDisabled) {
    return null;
  }

  return <ArchiveRestoreCTAs category={shownCategory} />;
};

const ArchiveRestoreCTAs = ({ category }: ArchiveRestoreCTAsProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useIODispatch();

  const archiveRestoreCTAEnabled = useIOSelector(state =>
    areThereEntriesForShownMessageListCategorySelector(state, category)
  );
  const isProcessing = useIOSelector(isArchivingInProcessingModeSelector);

  return (
    <View
      style={[styles.container, { paddingBottom: 8 + safeAreaInsets.bottom }]}
    >
      <View style={styles.startButtonContainer}>
        <IOButton
          fullWidth
          label={I18n.t("global.buttons.cancel")}
          onPress={() => dispatch(resetMessageArchivingAction(undefined))}
          variant="outline"
        />
      </View>
      <View style={styles.endButtonContainer}>
        <IOButton
          disabled={!archiveRestoreCTAEnabled}
          fullWidth
          label={I18n.t(
            `messages.cta.${category === "ARCHIVE" ? "unarchive" : "archive"}`
          )}
          loading={isProcessing}
          onPress={() => dispatch(startProcessingMessageArchivingAction())}
          variant="solid"
        />
      </View>
    </View>
  );
};
