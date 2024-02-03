import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Divider, IOColors, Icon } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { H5 } from "../../../../components/core/typography/H5";
import I18n from "../../../../i18n";
import { UIAttachment } from "../../types";
import { ContentTypeValues } from "../../types/contentType";
import { formatByte } from "../../types/digitalInformationUnit";
import { useLegacyAttachmentDownload } from "../../hooks/useLegacyAttachmentDownload";

type PartialProps = {
  disabled?: boolean;
  downloadAttachmentBeforePreview?: boolean;
  openPreview: (attachment: UIAttachment) => void;
};

type LegacyMessageAttachmentProps = {
  attachment: UIAttachment;
} & PartialProps;

type LegacyMessageAttachmentsProps = {
  attachments: ReadonlyArray<UIAttachment>;
} & PartialProps;

const styles = StyleSheet.create({
  opacityDisabled: {
    opacity: 0.5
  },
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
const LegacyAttachmentIcon = (props: {
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
 * Represent a single attachment.
 * An item that displays the file name and size.
 * @param props
 * @constructor
 */
const LegacyAttachmentItem = (props: LegacyMessageAttachmentProps) => {
  const { downloadPot, onAttachmentSelect } = useLegacyAttachmentDownload(
    props.attachment,
    props.downloadAttachmentBeforePreview,
    props.openPreview
  );
  return (
    <TouchableOpacity
      style={[
        styles.container,
        props.disabled ? styles.opacityDisabled : undefined
      ]}
      onPress={onAttachmentSelect}
      disabled={!!props.disabled || pot.isLoading(downloadPot)}
      accessible={true}
      accessibilityLabel={props.attachment.displayName}
      accessibilityRole="button"
      testID="MessageAttachmentTouchable"
    >
      <View style={styles.row}>
        <View style={styles.icon}>
          <LegacyAttachmentIcon contentType={props.attachment.contentType} />
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
 * Render all the attachments as listItem that can have different representation based on the contentType
 *
 * @deprecated It will be removed in favour of MessageAttachments
 */
export const LegacyMessageAttachments = ({
  attachments = [],
  ...rest
}: LegacyMessageAttachmentsProps) => (
  <>
    {attachments.map((attachment, index) => (
      <View key={index} testID="MessageAttachmentContainer">
        <LegacyAttachmentItem {...rest} attachment={attachment} />
        {index < attachments.length - 1 && <Divider />}
      </View>
    ))}
  </>
);
