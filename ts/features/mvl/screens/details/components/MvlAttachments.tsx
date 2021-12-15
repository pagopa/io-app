import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Svg from "react-native-svg";
import { H2 } from "../../../../../components/core/typography/H2";
import { H3 } from "../../../../../components/core/typography/H3";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import IconFont from "../../../../../components/ui/IconFont";
import { formatByte } from "../../../../../types/digitalInformationUnit";
import { MvlAttachment, MvlData } from "../../../types/mvlData";
import Pdf from "../../../../../../img/features/mvl/attachmentsIcon/pdf.svg";
import Default from "../../../../../../img/features/mvl/attachmentsIcon/default.svg";
import I18n from "../../../../../i18n";

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
  },
  icon: {
    alignSelf: "center"
  },
  paddingLeft: {
    paddingLeft: 8
  }
});

const svgProps: React.ComponentProps<typeof Svg> = {
  width: 32,
  height: 32,
  fill: IOColors.blue,
  style: styles.icon
};

const AttachmentIcon = (props: {
  contentType: MvlAttachment["contentType"];
}) => {
  switch (props.contentType) {
    case "application/pdf":
      return <Pdf {...svgProps} />;
    case "other":
      return <Default {...svgProps} />;
  }
};

const MvlAttachmentItem = (props: { attachment: MvlAttachment }) => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => console.log(props.attachment.resourceUrl)}
  >
    <View style={styles.flexColumn}>
      <View style={styles.row}>
        <AttachmentIcon contentType={props.attachment.contentType} />
        <View style={[IOStyles.flex, styles.paddingLeft]}>
          <H3
            color={"bluegrey"}
            weight={"SemiBold"}
            ellipsizeMode={"middle"}
            numberOfLines={1}
          >
            {props.attachment.name}
          </H3>
          <H5 color={"bluegrey"} weight={"Regular"}>
            {formatByte(props.attachment.size)}
          </H5>
        </View>
        <IconFont
          name={"io-right"}
          color={IOColors.blue}
          size={24}
          style={styles.icon}
        />
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
    <ItemSeparatorComponent noPadded={true} />
    <View spacer={true} large={true} />
    <H2>{I18n.t("features.mvl.details.attachments.title")}</H2>
    {props.attachments.map((attachment, index) => (
      <View key={index}>
        <MvlAttachmentItem attachment={attachment} />
        {index < props.attachments.length - 1 && (
          <ItemSeparatorComponent noPadded={true} />
        )}
      </View>
    ))}
  </>
);
