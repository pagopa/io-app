import { Divider, H3, LabelSmall, VSpacer } from "@pagopa/io-app-design-system";
import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";

export type MessageDetailHeaderProps = PropsWithChildren<{
  createdAt: Date;
  subject: string;
  sender?: string;
  service?: ServicePublic;
}>;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24
  }
});

const MessageHeaderContent = ({
  subject,
  createdAt
}: MessageDetailHeaderProps) => (
  <>
    <H3 testID="message-header-subject">{subject}</H3>
    <VSpacer size={8} />
    <LabelSmall fontSize="regular" color="grey-700">
      {localeDateFormat(
        createdAt,
        I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
      )}
    </LabelSmall>
  </>
);

export const MessageDetailHeader = ({
  children,
  ...rest
}: MessageDetailHeaderProps) => (
  <View style={styles.header}>
    {children}
    <MessageHeaderContent {...rest} />
    <VSpacer size={8} />
    <Divider />
    {/* TODO: Add MessageHeaderService */}
  </View>
);
