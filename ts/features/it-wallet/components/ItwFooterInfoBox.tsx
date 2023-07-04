import React from "react";
import { StyleSheet, View } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Divider } from "../../../components/core/Divider";
import Markdown from "../../../components/ui/Markdown";
import { Icon } from "../../../components/core/icons";

type Props = {
  content: string;
  infoIcon?: boolean;
};

const styles = StyleSheet.create({
  icon: {
    alignContent: "center",
    justifyContent: "center",
    marginRight: 8
  }
});

/**
 * This is a component that is used in the footer of the ItwWalletScreen.
 * It is used to display information about the wallet. It could have an info icon
 * and a content as markdown text.
 */
const ItwFooterInfoBox = (props: Props) => (
  <View style={IOStyles.horizontalContentPadding}>
    <VSpacer />
    <Divider />
    <VSpacer />
    <View style={IOStyles.row}>
      {props.infoIcon ? (
        <View style={styles.icon}>
          <Icon name="info" size={24} />
        </View>
      ) : null}
      <Markdown avoidTextSelection={true}>{props.content}</Markdown>
    </View>
  </View>
);

export default ItwFooterInfoBox;
