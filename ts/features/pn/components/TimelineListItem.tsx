import {
  Alert,
  IOVisualCostants,
  ListItemAction
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo, useState } from "react";
import { Dimensions, View } from "react-native";

import { NotificationStatusHistory } from "../../../../definitions/pn/NotificationStatusHistory";
import { useIOSelector } from "../../../store/hooks";
import {
  isAarInAppDelegationRemoteEnabledSelector,
  pnFrontendUrlSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { formatDateAsDay, formatDateAsMonth } from "../../../utils/dates";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { handleItemOnPress } from "../../../utils/url";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { trackPNShowTimeline, trackPNTimelineExternal } from "../analytics";
import {
  getNotificationStatusInfo,
  notificationStatusToTimelineStatus
} from "../utils";
import { Timeline, TimelineItemProps } from "./Timeline";

const topBottomSheetMargin = 122;
const baseFooterHeightWithAlert = 181;
const timelineBottomMarginWithAlert = 288;
const timelineBottomMarginWithoutAlert = 128;
const timelineItemHeight = 70;

export type TimelineListItemProps = {
  history: NotificationStatusHistory;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

const generateTimelineData = (
  history: NotificationStatusHistory
): ReadonlyArray<TimelineItemProps> =>
  [...history].reverse().map(historyItem => ({
    day: formatDateAsDay(historyItem.activeFrom),
    month: formatDateAsMonth(historyItem.activeFrom),
    time: new Intl.DateTimeFormat("it", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(historyItem.activeFrom),
    description: getNotificationStatusInfo(historyItem.status),
    status: notificationStatusToTimelineStatus(historyItem.status)
  }));

export const TimelineListItem = ({
  history,
  sendOpeningSource,
  sendUserType
}: TimelineListItemProps) => {
  const sendExternalUrl = useIOSelector(pnFrontendUrlSelector);
  const temporaryMandateEnabled = useIOSelector(
    isAarInAppDelegationRemoteEnabledSelector
  );

  const hideFooter =
    temporaryMandateEnabled &&
    sendOpeningSource === "aar" &&
    sendUserType === "mandatory";
  const baseFooterHeight = hideFooter ? 0 : baseFooterHeightWithAlert;
  const [footerHeight, setFooterHeight] = useState<number>(baseFooterHeight);

  const timelineBottomMargin = hideFooter
    ? timelineBottomMarginWithoutAlert
    : timelineBottomMarginWithAlert;

  const windowHeight = Dimensions.get("window").height;
  const snapPoint = Math.min(
    windowHeight - topBottomSheetMargin,
    timelineBottomMargin + timelineItemHeight * history.length
  );

  const timelineData = useMemo(() => generateTimelineData(history), [history]);
  const { bottomSheet, present } = useIOBottomSheetModal({
    component: <Timeline data={timelineData} footerHeight={footerHeight} />,
    title: I18n.t("features.pn.details.timeline.menuTitle"),
    footer: !hideFooter ? (
      <View
        onLayout={layoutChangeEvent =>
          setFooterHeight(layoutChangeEvent.nativeEvent.layout.height)
        }
        style={{ padding: IOVisualCostants.appMarginDefault }}
      >
        <Alert
          action={
            sendExternalUrl
              ? I18n.t("features.pn.details.timeline.goToSend")
              : undefined
          }
          content={`${I18n.t("features.pn.details.timeline.newInfo")}`}
          onPress={() => {
            if (sendExternalUrl) {
              trackPNTimelineExternal(sendOpeningSource, sendUserType);
              handleItemOnPress(sendExternalUrl)();
            }
          }}
          testID="timeline_listitem_bottom_menu_alert"
          variant="info"
        />
      </View>
    ) : (
      <View />
    ),
    snapPoint: [snapPoint]
  });

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("features.pn.details.timeline.menuTitle")}
        icon="history"
        label={I18n.t("features.pn.details.timeline.menuTitle")}
        onPress={() => {
          trackPNShowTimeline(sendOpeningSource, sendUserType);
          present();
        }}
        testID="timeline_listitem_bottom_menu"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
