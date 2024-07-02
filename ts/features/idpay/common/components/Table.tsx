import React, { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, WithTestID } from "@pagopa/io-app-design-system";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";

export type TableRow = WithTestID<{
  label: string;
  value: string | React.ReactNode;
}>;

type TableProps = {
  title: string;
  rows: ReadonlyArray<TableRow>;
};

const renderTable = (data: ReadonlyArray<TableRow>): React.ReactNode =>
  data.map((item, index) => {
    const isLast = data.length === index + 1;

    return (
      <Fragment key={`${item.label}_${index}`}>
        <View style={styles.infoRow} testID={item.testID}>
          <Body>{item.label}</Body>
          <Body weight="SemiBold">{item.value}</Body>
        </View>
        {!isLast && <Divider />}
      </Fragment>
    );
  });

export const Table = (props: TableProps) => (
  <>
    <View style={styles.sectionHeader}>
      <H3>{props.title}</H3>
    </View>
    {renderTable(props.rows)}
  </>
);

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
