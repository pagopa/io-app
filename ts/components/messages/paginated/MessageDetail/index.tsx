import { Content } from "native-base";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ServicePublicService_metadata } from "../../../../../definitions/backend/ServicePublic";
import variables from "../../../../theme/variables";
import {
  UIMessage,
  UIMessageDetails
} from "../../../../store/reducers/entities/messages/types";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";

type Props = Readonly<{
  hasPaidBadge: boolean;
  message: UIMessage;
  messageDetails: UIMessageDetails;
  navigateToWalletHome: () => void;
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServicePublicService_metadata;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  }
});

/**
 * A component to render the message detail.
 * TODO: https://pagopa.atlassian.net/browse/IA-465
 */
const MessageDetailComponent = ({ message }: Props) => (
  <>
    <Content noPadded={true}>
      <View style={styles.padded}>
        <Text>{`${message.id} - TODO: https://pagopa.atlassian.net/browse/IA-465`}</Text>
      </View>
    </Content>
  </>
);

export default MessageDetailComponent;
