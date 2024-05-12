import { IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import EidCardShape from "../../../../../img/features/itw/eid_card.svg";

export type EIdCardProps = {
  isExpired?: boolean;
};

export const EIdCard = ({ isExpired = false }: EIdCardProps) => (
    <View style={[styles.container, isExpired && styles.expiredContainer]}>
      <View style={styles.card}>
        <EidCardShape />
      </View>
    </View>
  );

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  expiredContainer: {
    borderColor: IOColors["error-600"],
    borderLeftWidth: 9,
    paddingLeft: 7
  }
});
