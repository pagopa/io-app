import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import {
  Alert,
  IOVisualCostants,
  ListItemAction
} from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { NotificationStatusHistory } from "../../../../definitions/pn/NotificationStatusHistory";
import { formatDateAsDay, formatDateAsMonth } from "../../../utils/dates";
import { localeDateFormat } from "../../../utils/locale";
import {
  getNotificationStatusInfo,
  notificationStatusToTimelineStatus
} from "../utils";
import { trackPNShowTimeline, trackPNTimelineExternal } from "../analytics";
import { handleItemOnPress } from "../../../utils/url";
import { useIOSelector } from "../../../store/hooks";
import { pnFrontendUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { Timeline, TimelineItemProps } from "./Timeline";

const topBottomSheetMargin = 122;
const timelineBottomMargin = 292;
const timelineItemHeight = 70;

type TimelineListItemProps = {
  history: NotificationStatusHistory;
};

const generateTimelineData = (
  history: NotificationStatusHistory
): ReadonlyArray<TimelineItemProps> =>
  [...history].reverse().map(historyItem => ({
    day: formatDateAsDay(historyItem.activeFrom),
    month: formatDateAsMonth(historyItem.activeFrom),
    time: localeDateFormat(
      historyItem.activeFrom,
      I18n.t("global.dateFormats.timeFormat")
    ),
    description: getNotificationStatusInfo(historyItem.status),
    status: notificationStatusToTimelineStatus(historyItem.status)
  }));

export const TimelineListItem = ({ history }: TimelineListItemProps) => {
  const windowHeight = Dimensions.get("window").height;
  const snapPoint = Math.min(
    windowHeight - topBottomSheetMargin,
    timelineBottomMargin + timelineItemHeight * history.length
  );
  const sendExternalUrl = useIOSelector(pnFrontendUrlSelector);
  const timelineData = useMemo(() => generateTimelineData(history), [history]);
  const { bottomSheet, present } = useIOBottomSheetModal({
    component: <Timeline data={timelineData} />,
    title: I18n.t("features.pn.details.timeline.menuTitle"),
    footer: (
      <View style={{ padding: IOVisualCostants.appMarginDefault }}>
        <Alert
          variant="info"
          content={`${I18n.t("features.pn.details.timeline.newInfo")}`}
          action={
            sendExternalUrl
              ? I18n.t("features.pn.details.timeline.goToSend")
              : undefined
          }
          onPress={() => {
            if (sendExternalUrl) {
              trackPNTimelineExternal();
              handleItemOnPress(sendExternalUrl)();
            }
          }}
        />
      </View>
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
          trackPNShowTimeline();
          present();
        }}
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
