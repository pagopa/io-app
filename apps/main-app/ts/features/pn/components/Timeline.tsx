import { Caption, H6, VSpacer } from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { usePnColors } from "../hooks/usePnColors";

export type TimelineItemProps = {
  accessibilityLabel: string;
  day: string;
  description: string;
  month: string;
  status: TimelineStatus;
  time: string;
};

export type TimelineProps = {
  data: ReadonlyArray<TimelineItemProps>;
  footerHeight: number;
};

export type TimelineStatus =
  | "cancelled"
  | "default"
  | "effective"
  | "unreachable"
  | "viewed";

type Position = {
  isFirst: boolean;
  isLast: boolean;
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24
  },
  oppositeContent: {
    alignItems: "center",
    paddingVertical: 12,
    width: 30
  },
  content: {
    flexShrink: 1,
    paddingVertical: 12
  },
  hidden: {
    opacity: 0
  },
  line: {
    alignItems: "center",
    paddingHorizontal: 16
  },
  rectangle: {
    flexGrow: 1,
    width: 2
  },
  dot: {
    marginVertical: 4,
    width: 14,
    height: 14,
    borderRadius: 14 / 2
  }
});

const borderWidth = 1.5;

const TimelineDot = ({
  isFirst,
  isLast,
  status
}: Pick<TimelineItemProps, "status"> & Position) => {
  const colors = usePnColors();

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: colors.timeline.status[status],
          borderColor: colors.timeline.dotRing,
          borderWidth: isFirst || isLast ? 0 : borderWidth
        }
      ]}
    />
  );
};

const TimelineSeparator = ({
  children,
  isFirst,
  isLast
}: PropsWithChildren<Pick<TimelineItemProps, "status"> & Position>) => {
  const colors = usePnColors();
  const lineStyle = [
    styles.rectangle,
    { backgroundColor: colors.timeline.line }
  ];

  return (
    <View style={styles.line}>
      <View style={[lineStyle, isFirst ? styles.hidden : undefined]} />
      {children}
      <View style={[lineStyle, isLast ? styles.hidden : undefined]} />
    </View>
  );
};

const TimelineOppositeContent = ({
  day,
  month
}: Pick<TimelineItemProps, "day" | "month">) => {
  const colors = usePnColors();

  return (
    <View style={styles.oppositeContent}>
      <H6 color={colors.timeline.day}>{day}</H6>
      <Caption color={colors.timeline.month}>{month}</Caption>
    </View>
  );
};

const TimelineContent = ({
  description,
  time
}: Pick<TimelineItemProps, "description" | "time">) => {
  const colors = usePnColors();

  return (
    <View style={styles.content}>
      <H6 color={colors.timeline.title}>{description}</H6>
      <VSpacer size={4} />
      <Caption color={colors.timeline.time}>{time}</Caption>
    </View>
  );
};

const TimelineItem = ({
  day,
  description,
  month,
  time,
  accessibilityLabel,
  ...rest
}: Position & TimelineItemProps) => (
  <View
    accessibilityLabel={accessibilityLabel}
    accessible={true}
    style={styles.item}
  >
    <TimelineOppositeContent day={day} month={month} />
    <TimelineSeparator {...rest}>
      <TimelineDot {...rest} />
    </TimelineSeparator>
    <TimelineContent description={description} time={time} />
  </View>
);

export const Timeline = ({ data = [], footerHeight }: TimelineProps) => (
  // Additional margin needed to allow proper scrolling of the timeline
  // 64 is the additional padding of the timeline that has to be removed
  <View collapsable={false} style={{ marginBottom: footerHeight - 64 }}>
    {data.map((item, i) => (
      <TimelineItem
        key={i}
        {...item}
        isFirst={i === 0}
        isLast={i === data.length - 1}
      />
    ))}
  </View>
);
