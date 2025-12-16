import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Caption, H6, IOColors, VSpacer } from "@pagopa/io-app-design-system";

type ColorStates = {
  background: string;
};

type Position = {
  isFirst: boolean;
  isLast: boolean;
};

export type TimelineStatus =
  | "default"
  | "viewed"
  | "unreachable"
  | "effective"
  | "cancelled";

export type TimelineItemProps = {
  day: string;
  description: string;
  month: string;
  time: string;
  status: TimelineStatus;
};

export type TimelineProps = {
  data: ReadonlyArray<TimelineItemProps>;
  footerHeight: number;
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
    width: 2,
    backgroundColor: IOColors["grey-200"]
  },
  dot: {
    marginVertical: 4,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    borderColor: IOColors.white
  }
});

const mapColorStatus: Record<NonNullable<TimelineStatus>, ColorStates> = {
  cancelled: {
    background: IOColors["warning-500"]
  },
  default: {
    background: IOColors["grey-300"]
  },
  effective: {
    background: IOColors["info-500"]
  },
  unreachable: {
    background: IOColors["error-500"]
  },
  viewed: {
    background: IOColors["success-500"]
  }
};

const borderWidth: number = 1.5;

const TimelineDot = ({
  isFirst,
  isLast,
  status
}: Pick<TimelineItemProps, "status"> & Position) => (
  <View
    style={[
      styles.dot,
      {
        backgroundColor: mapColorStatus[status].background,
        borderWidth: isFirst || isLast ? 0 : borderWidth
      }
    ]}
  />
);

const TimelineSeparator = ({
  children,
  isFirst,
  isLast
}: PropsWithChildren<Pick<TimelineItemProps, "status"> & Position>) => (
  <View style={styles.line}>
    <View style={[styles.rectangle, isFirst ? styles.hidden : undefined]} />
    {children}
    <View style={[styles.rectangle, isLast ? styles.hidden : undefined]} />
  </View>
);

const TimelineOppositeContent = ({
  day,
  month
}: Pick<TimelineItemProps, "day" | "month">) => (
  <View style={styles.oppositeContent}>
    <H6 color="grey-700">{day}</H6>
    <Caption color="grey-450">{month}</Caption>
  </View>
);

const TimelineContent = ({
  description,
  time
}: Pick<TimelineItemProps, "description" | "time">) => (
  <View style={styles.content}>
    <H6 color="grey-700">{description}</H6>
    <VSpacer size={4} />
    <Caption color="grey-450">{time}</Caption>
  </View>
);

const TimelineItem = ({
  day,
  description,
  month,
  time,
  ...rest
}: TimelineItemProps & Position) => (
  <View accessible={true} style={styles.item}>
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
