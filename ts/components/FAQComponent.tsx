import { Accordion, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import {
  FAQsCategoriesType,
  FAQType,
  getFAQsFromCategories
} from "../utils/faq";
import ItemSeparatorComponent from "./ItemSeparatorComponent";
import IconFont from "./ui/IconFont";
import Markdown from "./ui/Markdown";

type Props = Readonly<{
  faqCategories: ReadonlyArray<FAQsCategoriesType>;
}>;

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
    paddingHorizontal: 10,
    alignSelf: "center"
  },
  noBorder: {
    borderWidth: 0
  },
  flex: {
    flex: 1
  }
});

export default function FAQComponent(props: Props) {
  const renderHeader = (item: FAQType, expanded: boolean) => {
    return (
      <React.Fragment>
        <View style={styles.header}>
          <Text bold={true} style={styles.flex}>
            {item.title}
          </Text>
          <IconFont
            name={"io-right"}
            color={customVariables.brandPrimary}
            size={24}
            style={[
              styles.headerIcon,
              {
                transform: [{ rotateZ: expanded ? "-90deg" : "90deg" }]
              }
            ]}
          />
        </View>
        {!expanded && <ItemSeparatorComponent noPadded={true} />}
      </React.Fragment>
    );
  };

  const renderContent = (item: FAQType) => (
    <View style={styles.pad}>
      <Markdown>{item.content}</Markdown>
    </View>
  );

  return (
    <Accordion
      dataArray={[...getFAQsFromCategories(props.faqCategories)]}
      renderHeader={renderHeader}
      renderContent={renderContent}
      style={styles.noBorder}
    />
  );
}
