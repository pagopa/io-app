import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Icon } from "../../../components/core/icons";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import I18n from "../../../i18n";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { ContentTypeValues } from "../../../types/contentType";
import { formatByte } from "../../../types/digitalInformationUnit";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";

type Props = {
  attachments: ReadonlyArray<UIAttachment>;
  openPreview: (attachment: UIAttachment) => void;
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
    alignItems: "center",
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
      return <Icon name="docAttachPDF" color="blue" size={32} />;
    default:
      return <Icon name="docAttach" color="blue" size={32} />;
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
  openPreview: (attachment: UIAttachment) => void;
}) => {
  const { downloadPot, onAttachmentSelect } = useAttachmentDownload(
    props.attachment,
    props.openPreview
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onAttachmentSelect}
      disabled={pot.isLoading(downloadPot)}
      accessible={true}
      accessibilityLabel={props.attachment.displayName}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        <View style={styles.icon}>
          <AttachmentIcon contentType={props.attachment.contentType} />
        </View>
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
          <Icon name="chevronRightListItem" color="blue" size={24} />
        )}
      </View>
    </TouchableOpacity>
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
