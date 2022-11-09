import React, { useEffect, useState } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H1 } from "../../../components/core/typography/H1";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Link } from "../../../components/core/typography/Link";
import { IOColors } from "../../../components/core/variables/IOColors";
import I18n from "../../../i18n";
import { formatDateAsDay, formatDateAsMonth } from "../../../utils/dates";
import { localeDateFormat } from "../../../utils/locale";
import { PNMessage } from "../store/types/types";
import { getNotificationStatusInfo } from "../utils";

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row"
  },
  date: {
    width: 50,
    alignItems: "center",
    marginRight: 8
  },
  month: {
    top: -10
  },
  timeline: {},
  line: {
    width: 1,
    backgroundColor: IOColors.bluegreyLight
  },
  topLine: {
    height: 16
  },
  hidden: {
    opacity: 0
  },
  bottomLine: { flex: 1 },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: IOColors.bluegreyLight,
    left: -3.5,
    marginVertical: 4
  },
  details: {
    marginLeft: 24,
    marginRight: 72,
    paddingBottom: 24
  }
});

type ItemProps = {
  day: string;
  month: string;
  time: string;
  text: string;
  hasPrevious: boolean;
  hasNext: boolean;
};

const PnMessageTimelineItem = (props: ItemProps) => (
  <View style={styles.row}>
    <View style={styles.date}>
      <H1 color="bluegreyDark">{props.day}</H1>
      <LabelSmall
        fontSize="small"
        color="bluegrey"
        weight="Regular"
        style={styles.month}
      >
        {props.month}
      </LabelSmall>
    </View>
    <View style={styles.timeline}>
      <View
        style={[
          styles.topLine,
          styles.line,
          props.hasPrevious ? undefined : styles.hidden
        ]}
      />
      <View style={styles.circle} />
      <View
        style={[
          styles.bottomLine,
          styles.line,
          props.hasNext ? undefined : styles.hidden
        ]}
      />
    </View>
    <View style={styles.details}>
      <LabelSmall fontSize="regular" color="bluegrey" weight="SemiBold">
        {props.time}
      </LabelSmall>
      <Body color="bluegreyDark" weight="SemiBold">
        {props.text}
      </Body>
    </View>
  </View>
);

type Props = Readonly<{
  message: PNMessage;
  onExpand?: () => void;
}>;

export const PnMessageTimeline = ({ message, onExpand }: Props & ViewProps) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (onExpand && expanded) {
      onExpand();
    }
  }, [onExpand, expanded]);

  if (message.notificationStatusHistory.length === 0) {
    return null;
  }

  const history = expanded
    ? [...message.notificationStatusHistory].reverse()
    : [
        message.notificationStatusHistory[
          message.notificationStatusHistory.length - 1
        ]
      ];

  return (
    <>
      {history.map((obj, i, arr) => {
        const props = {
          day: formatDateAsDay(obj.activeFrom),
          month: formatDateAsMonth(obj.activeFrom),
          time: localeDateFormat(
            obj.activeFrom,
            I18n.t("global.dateFormats.timeFormat")
          ),
          text: getNotificationStatusInfo(obj.status),
          hasNext: i < arr.length - 1,
          hasPrevious: i > 0
        } as ItemProps;
        return <PnMessageTimelineItem key={i} {...props} />;
      })}
      {!expanded && message.notificationStatusHistory.length > 1 && (
        <Link onPress={() => setExpanded(true)} style={{ paddingBottom: 24 }}>
          {I18n.t("features.pn.details.timeline.expand")}
        </Link>
      )}
    </>
  );
};
