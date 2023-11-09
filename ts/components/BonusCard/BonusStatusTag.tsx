import { Chip, HSpacer, IOColors, Tag } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { formatDateAsShortFormat } from "../../utils/dates";
import { BonusStatus } from "./type";

export type BonusStatusTag =
  | {
      isLoading: true;
    }
  | {
      isLoading?: never;
      endDate: Date;
      status: BonusStatus;
    };

export const BonusStatusTag = (props: BonusStatusTag) => (
  <View style={styles.container}>
    <BonusStatusTagContent {...props} />
  </View>
);

const BonusStatusTagContent = (props: BonusStatusTag) => {
  if (props.isLoading) {
    return (
      <Placeholder.Box
        height={16}
        width={278}
        color={IOColors["blueItalia-100"]}
        animate="fade"
        radius={16}
      />
    );
  }

  const validityText = `Valida fino al ${formatDateAsShortFormat(
    props.endDate
  )}`;

  switch (props.status) {
    case "ACTIVE":
      return <Chip color="grey-650">{validityText}</Chip>;
    case "PAUSED":
      return (
        <>
          <Tag variant="info" text="In pausa" />
          <HSpacer size={8} />
          <Chip color="grey-650">{validityText}</Chip>
        </>
      );
    case "ENDING":
      const endingDateText = `Scade il ${formatDateAsShortFormat(
        props.endDate
      )}`;
      return <Tag variant="warning" text={endingDateText} />;
    case "REMOVED":
      return <Tag variant="error" text="Rimossa" />;
  }
};

const styles = StyleSheet.create({
  container: {
    height: 30,
    flexDirection: "row",
    alignItems: "center"
  }
});
