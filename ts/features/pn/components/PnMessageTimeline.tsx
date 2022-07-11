import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { PNMessage } from "../store/types/types";
import customVariables from "../../../theme/variables";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { H2 } from "../../../components/core/typography/H2";
import { Body } from "../../../components/core/typography/Body";

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
  timeline: {},
  line: {
    width: 2,
    backgroundColor: "#BACCD9"
  },
  topLine: {
    height: 25
  },
  hidden: {
    opacity: 0
  },
  bottomLine: { flex: 1 },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#BACCD9",
    left: -3
  },
  details: {
    marginLeft: 24,
    paddingBottom: 24
  }
});

type Props = Readonly<{ message: PNMessage }>;

export const PnMessageTimeline = (props: Props & ViewProps) => (
  <>
    <View style={styles.row}>
      <View style={styles.date}>
        <H2 color="bluegrey">7</H2>
        <LabelSmall fontSize="small" color="bluegrey">
          LUG
        </LabelSmall>
      </View>
      <View style={styles.timeline}>
        <View style={[styles.topLine, styles.line, styles.hidden]} />
        <View style={styles.circle} />
        <View style={[styles.bottomLine, styles.line]} />
      </View>
      <View style={styles.details}>
        <LabelSmall fontSize="small" color="bluegrey">
          16:26
        </LabelSmall>
        <Body color="bluegreyDark">Perfezionata per visione</Body>
      </View>
    </View>
    <View style={styles.row}>
      <View style={styles.date}>
        <H2 color="bluegrey">7</H2>
        <LabelSmall fontSize="small" color="bluegrey">
          LUG
        </LabelSmall>
      </View>
      <View style={styles.timeline}>
        <View style={[styles.topLine, styles.line]} />
        <View style={styles.circle} />
        <View style={[styles.bottomLine, styles.line]} />
      </View>
      <View style={styles.details}>
        <LabelSmall fontSize="small" color="bluegrey">
          15:27
        </LabelSmall>
        <Body color="bluegreyDark">Invio in corso</Body>
      </View>
    </View>
    <View style={styles.row}>
      <View style={styles.date}>
        <H2 color="bluegrey">7</H2>
        <LabelSmall fontSize="small" color="bluegrey">
          LUG
        </LabelSmall>
      </View>
      <View style={styles.timeline}>
        <View style={[styles.topLine, styles.line]} />
        <View style={styles.circle} />
        <View style={[styles.bottomLine, styles.line, styles.hidden]} />
      </View>
      <View style={styles.details}>
        <LabelSmall fontSize="small" color="bluegrey">
          15:26
        </LabelSmall>
        <Body color="bluegreyDark">Depositata</Body>
      </View>
    </View>
  </>
);
