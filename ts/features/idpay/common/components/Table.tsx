import React, { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { Divider } from "../../../../components/core/Divider";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";

export type TableItem = {
  label: string;
  value: string | ReadonlyArray<TableItem>;
};

type TableProps = {
  items: ReadonlyArray<TableItem>;
};

const renderTable = (data: ReadonlyArray<TableItem>): React.ReactNode =>
  data.map((item, index) => {
    if (Array.isArray(item.value)) {
      return (
        <Fragment key={item.label}>
          <View style={styles.sectionHeader}>
            <H3>{item.label}</H3>
          </View>
          {renderTable(item.value)}
          <VSpacer size={16} />
        </Fragment>
      );
    }

    const isLast = data.length === index + 1;

    return (
      <Fragment key={item.label}>
        <View style={styles.infoRow}>
          <Body>{item.label}</Body>
          <Body weight="SemiBold">{item.value}</Body>
        </View>
        {!isLast && <Divider />}
      </Fragment>
    );
  });

export const Table = (props: TableProps) => <>{renderTable(props.items)}</>;

const styles = StyleSheet.create({
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8
  },
  infoRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  }
});
