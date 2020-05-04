import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewProps } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServiceMetadataState } from "../../store/reducers/content";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import { format, formatDateAsLocal } from "../../utils/dates";
import CopyButtonComponent from "../CopyButtonComponent";
import BlockButtons from "../ui/BlockButtons";

const styles = StyleSheet.create({
  container: {
    backgroundColor: customVariables.brandGray,
    padding: customVariables.contentPadding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  flex: {
    flex: 1
  }
});

type OwnProps = Readonly<{
  message: CreatedMessageWithContent;
  serviceDetail: pot.Pot<ServicePublic, Error>;
  serviceMetadata?: ServiceMetadataState;
  paymentsByRptId?: PaymentByRptIdState;
  goToServiceDetail?: () => void;
}>;

type Props = OwnProps & ViewProps;

export default function MessageDetailData(props: Props) {
  const dateFormat = formatDateAsLocal(props.message.created_at, true, true);
  const date = format(props.message.created_at, dateFormat);
  const time = format(props.message.created_at, "hh:mm");

  const organizationName = pot.getOrElse(
    pot.map(props.serviceDetail, s => s.organization_name),
    undefined
  );

  const serviceDetail = pot.getOrElse(
    pot.map(props.serviceDetail, s => s),
    undefined
  );

  const serviceName = pot.getOrElse(
    pot.map(props.serviceDetail, s => s.service_name),
    undefined
  );

  const messageId = props.message.id;

  return (
    <View style={styles.container}>
      <Text>
        {I18n.t("messageDetails.dateSending")}
        <Text bold={true}>{` ${date} - ${time}`}</Text>
      </Text>

      {organizationName && (
        <Text>
          {I18n.t("messageDetails.sender")}
          <Text bold={true}>{` ${organizationName}`}</Text>
        </Text>
      )}

      {serviceName &&
        serviceDetail && (
          <Text>
            {`${I18n.t("messageDetails.service")} `}
            <Text
              bold={true}
              link={serviceDetail !== undefined}
              onPress={props.goToServiceDetail}
            >
              {serviceName}
            </Text>
          </Text>
        )}

      <View spacer={true} />

      <Text bold={true}>{I18n.t("messageDetails.question")}</Text>
      <Text>{I18n.t("messageDetails.answer")}</Text>

      <View spacer={true} />

        <React.Fragment>
          <View style={styles.row}>
            <Text style={styles.flex}>{`${I18n.t(
              "messageDetails.id"
            )} ${messageId}`}</Text>
            <CopyButtonComponent textToCopy={messageId} />
          </View>
          <View spacer={true} />
        </React.Fragment>

      <BlockButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          bordered: true,
          white: true,
          title: I18n.t("messageDetails.call"),
          onPress: () => {
            /** TODO */
          }
        }}
        rightButton={{
          bordered: true,
          white: true,
          title: I18n.t("messageDetails.write"),
          iconName: "io-envelope",
          onPress: () => {
            /** TODO */
          }
        }}
      />
    </View>
  );
}
