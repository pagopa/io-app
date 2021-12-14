import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { H2 } from "../../../../../components/core/typography/H2";
import { H3 } from "../../../../../components/core/typography/H3";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../../components/ui/IconFont";
import { formatByte } from "../../../../../types/digitalInformationUnit";
import { MvlAttachment, MvlData } from "../../../types/mvlData";

type Props = {
  attachments: MvlData["attachments"];
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 0,
    paddingLeft: 0,
    marginVertical: 20,
    height: 60,
    backgroundColor: IOColors.white
  },
  flexColumn: {
    flexDirection: "column",
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});

const MvlAttachmentItem = (props: { attachment: MvlAttachment }) => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => console.log("onpress")}
  >
    <View style={styles.flexColumn}>
      <View style={styles.row}>
        <View style={IOStyles.flex}>
          <H3
            color={"bluegrey"}
            weight={"SemiBold"}
            ellipsizeMode={"middle"}
            numberOfLines={2}
          >
            {props.attachment.name}
          </H3>
          <H5 color={"bluegrey"} weight={"Regular"}>
            {formatByte(1037)}
          </H5>
        </View>
        <IconFont name={"io-right"} color={IOColors.blue} size={24} />
      </View>
    </View>
  </TouchableOpacity>
);

/**
 * Render all the attachments of a legal message as listItem that can have different representation based on the contentType
 * @constructor
 * @param props
 */
export const MvlAttachments = (props: Props): React.ReactElement => (
  <>
    {props.attachments.map((attachment, index) => (
      <MvlAttachmentItem attachment={attachment} key={index} />
    ))}
  </>
);
