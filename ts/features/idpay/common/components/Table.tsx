import { Fragment, ReactNode } from "react";

import { StyleSheet, View } from "react-native";
import { Body, Divider, H6, WithTestID } from "@pagopa/io-app-design-system";

export type TableRow = WithTestID<{
  label: string;
  value: string | ReactNode;
}>;

type TableProps = {
  title: string;
  rows: ReadonlyArray<TableRow>;
};

const renderTable = (data: ReadonlyArray<TableRow>): ReactNode =>
  data.map((item, index) => {
    const isLast = data.length === index + 1;

    return (
      <Fragment key={`${item.label}_${index}`}>
        <View style={styles.infoRow} testID={item.testID}>
          <Body>{item.label}</Body>
          <Body weight="Semibold">{item.value}</Body>
        </View>
        {!isLast && <Divider />}
      </Fragment>
    );
  });

export const Table = (props: TableProps) => (
  <>
    <View style={styles.sectionHeader}>
      <H6>{props.title}</H6>
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
