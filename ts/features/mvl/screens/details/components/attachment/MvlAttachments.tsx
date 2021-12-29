import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Svg from "react-native-svg";
import Default from "../../../../../../../img/features/mvl/attachmentsIcon/default.svg";
import Pdf from "../../../../../../../img/features/mvl/attachmentsIcon/pdf.svg";
import { H2 } from "../../../../../../components/core/typography/H2";
import { H3 } from "../../../../../../components/core/typography/H3";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../../components/ItemSeparatorComponent";
import IconFont from "../../../../../../components/ui/IconFont";
import I18n from "../../../../../../i18n";
import { ContentTypeValues } from "../../../../../../types/contentType";
import { formatByte } from "../../../../../../types/digitalInformationUnit";
import { MvlAttachment, MvlData } from "../../../../types/mvlData";
import { useDownloadAttachmentConfirmationBottomSheet } from "./DownloadAttachmentConfirmationBottomSheet";

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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flex: 1
  },
  icon: {
    alignSelf: "center"
  },
  middleSection: {
    flex: 1,
    paddingLeft: 8
  },
  middleLayout: {
    flex: 1,
    justifyContent: "center"
  }
});

const svgProps: React.ComponentProps<typeof Svg> = {
  width: 32,
  height: 32,
  fill: IOColors.blue,
  style: styles.icon
};

/**
 * Custom icon for the attachment, based on the contentType (at the moment only the pdf have a custom representation)
 * @param props
 * @constructor
 */
const AttachmentIcon = (props: {
  contentType: MvlAttachment["contentType"];
}) => {
  switch (props.contentType) {
    case ContentTypeValues.applicationPdf:
      return <Pdf {...svgProps} />;
    default:
      return <Default {...svgProps} />;
  }
};

/**
 * Represent a single attachment of the legal message.
 * An item that displays the file name and size.
 * @param props
 * @constructor
 */
const MvlAttachmentItem = (props: { attachment: MvlAttachment }) => {
  const { present } = useDownloadAttachmentConfirmationBottomSheet(
    props.attachment
  );

  return (
    // TODO: should present only if the user doesn't choose "don't ask again" https://pagopa.atlassian.net/browse/IAMVL-26
    <TouchableOpacity style={styles.container} onPress={present}>
      <View style={styles.row}>
        <AttachmentIcon contentType={props.attachment.contentType} />
        <View style={styles.middleSection}>
          <View style={styles.middleLayout}>
            <H3
              color={"bluegrey"}
              weight={"SemiBold"}
              ellipsizeMode={"middle"}
              numberOfLines={1}
            >
              {props.attachment.displayName}
            </H3>
            {props.attachment.size && (
              <H5 color={"bluegrey"} weight={"Regular"} style={IOStyles.flex}>
                {formatByte(props.attachment.size)}
              </H5>
            )}
          </View>
        </View>
        <IconFont
          name={"io-right"}
          color={IOColors.blue}
          size={24}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Render all the attachments of a legal message as listItem that can have different representation based on the contentType
 * @constructor
 * @param props
 */
export const MvlAttachments = (props: Props): React.ReactElement | null =>
  props.attachments.length > 0 ? (
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
  ) : null;
