import * as pot from "@pagopa/ts-commons/lib/pot";
import { View } from "native-base";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import Svg from "react-native-svg";
import Default from "../../../../img/messages/attachments/default.svg";
import Pdf from "../../../../img/messages/attachments/pdf.svg";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import {
  UIAttachment,
  UIAttachmentId
} from "../../../store/reducers/entities/messages/types";
import { ContentTypeValues } from "../../../types/contentType";
import { formatByte } from "../../../types/digitalInformationUnit";
import { MvlData } from "../../mvl/types/mvlData";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";

type Props = {
  attachments: MvlData["attachments"];
  openPreview: (attachmentId: UIAttachmentId) => void;
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 0,
    paddingLeft: 0,
    marginVertical: 0,
    height: 80,
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
    paddingLeft: 8,
    alignSelf: "center"
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
  contentType: UIAttachment["contentType"];
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
const AttachmentItem = (props: {
  attachment: UIAttachment;
  openPreview: (attachmentId: UIAttachmentId) => void;
}) => {
  const { downloadPot, onAttachmentSelect, bottomSheet } =
    useAttachmentDownload(props.attachment, props.openPreview);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onAttachmentSelect}
        disabled={pot.isLoading(downloadPot)}
      >
        <View style={styles.row}>
          <AttachmentIcon contentType={props.attachment.contentType} />
          <View style={styles.middleSection}>
            <H5
              color={"bluegrey"}
              weight={"SemiBold"}
              ellipsizeMode={"middle"}
              numberOfLines={2}
            >
              {props.attachment.displayName}
            </H5>
            {typeof props.attachment.size !== "undefined" && (
              <H5 color={"bluegrey"} weight={"Regular"}>
                {formatByte(props.attachment.size)}
              </H5>
            )}
          </View>
          {pot.isLoading(downloadPot) ? (
            <ActivityIndicator
              accessibilityLabel={I18n.t("global.remoteStates.loading")}
              color={IOColors.blue}
              style={{ ...styles.icon, width: 24 }}
              testID={"attachmentActivityIndicator"}
            />
          ) : (
            <IconFont
              name={"io-right"}
              color={IOColors.blue}
              size={24}
              style={styles.icon}
            />
          )}
        </View>
      </TouchableOpacity>
      {bottomSheet}
    </>
  );
};

/**
 * Render all the attachments of a legal message as listItem that can have different representation based on the contentType
 * @constructor
 * @param props
 */
export const MessageAttachments = (props: Props): React.ReactElement | null =>
  props.attachments.length > 0 ? (
    <>
      {props.attachments.map((attachment, index) => (
        <View key={index}>
          <AttachmentItem
            attachment={attachment}
            openPreview={props.openPreview}
          />
          {index < props.attachments.length - 1 && (
            <ItemSeparatorComponent noPadded={true} />
          )}
        </View>
      ))}
    </>
  ) : null;
