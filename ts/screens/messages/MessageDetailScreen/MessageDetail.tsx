import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import {
  ServicePublic,
  ServicePublicService_metadata
} from "../../../../definitions/backend/ServicePublic";
import MessageDetailComponent from "../../../components/messages/MessageDetailComponent";
import I18n from "../../../i18n";
import { PaymentByRptIdState } from "../../../store/reducers/entities/payments";
import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/CreatedMessageWithContentAndAttachments";

import ErrorState from "./ErrorState";

type Props = {
  goBack: () => void;
  potMessage: pot.Pot<
    CreatedMessageWithContentAndAttachments,
    string | undefined
  >;
  messageId: string;
  onRetry: () => void;
  onServiceLinkPressHandler: (id: string) => void;
  paymentsByRptId: PaymentByRptIdState;
  service?: ServicePublic;
  maybeServiceMetadata?: ServicePublicService_metadata;
};

const styles = StyleSheet.create({
  notFullStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  notFullStateMessageText: {
    marginBottom: 10
  }
});

const messageDetail = ({
  goBack,
  potMessage,
  maybeServiceMetadata,
  messageId,
  onRetry,
  onServiceLinkPressHandler,
  paymentsByRptId,
  service
}: Props) => {
  if (pot.isSome(potMessage)) {
    return (
      <MessageDetailComponent
        message={potMessage.value}
        paymentsByRptId={paymentsByRptId}
        serviceMetadata={maybeServiceMetadata}
        serviceDetail={service}
        onServiceLinkPress={() => {
          if (service) {
            onServiceLinkPressHandler(service.service_id);
          }
        }}
      />
    );
  }

  if (pot.isLoading(potMessage)) {
    return (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.loadingText")}
        </Text>
        <ActivityIndicator />
      </View>
    );
  }

  if (pot.isError(potMessage)) {
    return (
      <ErrorState messageId={messageId} onRetry={onRetry} goBack={goBack} />
    );
  }

  // Fallback to invalid state
  return (
    <View style={styles.notFullStateContainer}>
      <Text style={styles.notFullStateMessageText}>
        {I18n.t("messageDetails.emptyMessage")}
      </Text>
    </View>
  );
};

export default messageDetail;
