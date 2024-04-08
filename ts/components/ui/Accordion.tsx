import { Icon } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { Body } from "../core/typography/Body";
import { IOStyles } from "../core/variables/IOStyles";
import LegacyMarkdown from "./Markdown/LegacyMarkdown";

type Props = {
  title: string;
  content: string;
  onLinkClicked?: ComponentProps<typeof LegacyMarkdown>["onLinkClicked"];
  shouldHandleLink?: ComponentProps<typeof LegacyMarkdown>["shouldHandleLink"];
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: customVariables.spacerHeight
  },
  pad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 *
 * @param props
 * @constructor
 * @deprecated Please use {@link RawAccordion}
 */
const Accordion: React.FunctionComponent<Props> = (props: Props) => {
  const [expanded, setExpanded] = React.useState(false);

  const renderHeader = (title: string) => (
    <TouchableDefaultOpacity
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={
        props.title +
        (expanded
          ? I18n.t("global.accessibility.expanded")
          : I18n.t("global.accessibility.collapsed"))
      }
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.header}>
        <View style={IOStyles.flex}>
          <Body weight="SemiBold">{title}</Body>
        </View>
        <View
          style={{
            transform: [{ rotateZ: expanded ? "0deg" : "180deg" }]
          }}
        >
          <Icon name="chevronTop" color="blue" size={24} />
        </View>
      </View>
      {!expanded && <ItemSeparatorComponent noPadded={true} />}
    </TouchableDefaultOpacity>
  );

  const renderContent = (content: string) => (
    <View style={styles.pad}>
      <LegacyMarkdown
        shouldHandleLink={props.shouldHandleLink}
        onLinkClicked={(url: string) => {
          pipe(
            props.onLinkClicked,
            O.fromNullable,
            O.map(s => s(url))
          );
        }}
      >
        {content}
      </LegacyMarkdown>
    </View>
  );

  return (
    <>
      {renderHeader(props.title)}
      {expanded && renderContent(props.content)}
    </>
  );
};

export default Accordion;
