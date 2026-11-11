import {
  Caption,
  H6,
  IOColorsLegacy,
  useIOColors,
  VSpacer
} from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

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

type ColorStates = {
  background: string;
};

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

const mapColorStatus: Record<NonNullable<TimelineStatus>, ColorStates> = {
  cancelled: {
    background: IOColorsLegacy["warning-500"]
  },
  default: {
    background: IOColorsLegacy["grey-300"]
  },
  effective: {
    background: IOColorsLegacy["info-500"]
  },
  unreachable: {
    background: IOColorsLegacy["error-500"]
  },
  viewed: {
    background: IOColorsLegacy["success-500"]
  }
};

const borderWidth = 1.5;

const TimelineDot = ({
  isFirst,
  isLast,
  status
}: Pick<TimelineItemProps, "status"> & Position) => {
  const colors = useIOColors();

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: mapColorStatus[status].background,
          // The ring separates the dot from the line, so it matches the sheet
          borderColor: colors.background.default,
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
  const colors = useIOColors();
  const lineStyle = [
    styles.rectangle,
    { backgroundColor: colors.stroke.divider }
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
  const colors = useIOColors();

  return (
    <View style={styles.oppositeContent}>
      <H6 color={colors.text.content.secondary}>{day}</H6>
      <Caption color={colors.text.content.tertiary}>{month}</Caption>
    </View>
  );
};

const TimelineContent = ({
  description,
  time
}: Pick<TimelineItemProps, "description" | "time">) => {
  const colors = useIOColors();

  return (
    <View style={styles.content}>
      <H6 color={colors.text.heading.secondary}>{description}</H6>
      <VSpacer size={4} />
      <Caption color={colors.text.content.tertiary}>{time}</Caption>
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
