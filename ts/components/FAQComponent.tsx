import { Accordion, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import ItemSeparatorComponent from "./ItemSeparatorComponent";
import IconFont from "./ui/IconFont";

type Props = Readonly<{
  data: FAQType[]; // tslint:disable-line readonly-array
}>;

type FAQType = {
  title: string;
  content: string;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: customVariables.spacerHeight
  },
  pad: { 
    paddingVertical: customVariables.spacerHeight 
  },
  headerIcon: { 
    paddingHorizontal: 10 
  },
  noBorder: { 
    borderWidth: 0 
  }
});

export default function FAQComponent(props: Props) {
  const renderHeader = (item: FAQType, expanded: boolean) => {
    return (
      <React.Fragment>
        <View style={styles.header}>
          <Text bold={true}>{item.title}</Text>
          <IconFont
            name={"io-right"}
            color={customVariables.brandPrimary}
            size={24}
            style={[
              styles.headerIcon,
              {
                transform: [
                  expanded ? { rotateZ: "-90deg" } : { rotateZ: "90deg" }
                ]
              }
            ]}
          />
        </View>
        <ItemSeparatorComponent noPadded={true} />
      </React.Fragment>
    );
  };

  const renderContent = (item: FAQType) => (
    <Text style={styles.pad}>{item.content}</Text>
  );

  return (
    <Accordion
      dataArray={props.data}
      renderHeader={renderHeader}
      renderContent={renderContent}
      style={styles.noBorder}
    />
  );
}
