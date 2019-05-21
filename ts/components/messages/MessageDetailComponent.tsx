import * as pot from "italia-ts-commons/lib/pot";
import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { messageNeedsCTABar } from "../../utils/messages";
import { logosForService } from "../../utils/services";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABarComponent from "./MessageCTABarComponent";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";
import MessageMarkdown from "./MessageMarkdown";

type OwnProps = {
  message: MessageWithContentPO;
  paymentsByRptId: PaymentByRptIdState;
  potService: pot.Pot<ServicePublic, Error>;
  onServiceLinkPress?: () => void;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  mainWrapper: {
    paddingBottom: 100
  },

  headerContainer: {
    padding: variables.contentPadding
  },

  serviceContainer: {
    marginBottom: variables.contentPadding
  },

  subjectContainer: {
    marginBottom: variables.contentPadding
  },

  ctaBarContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding,
    marginBottom: variables.contentPadding
  },

  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  },

  serviceCol: {
    width: 60
  },

  serviceMultiImage: {
    width: 60,
    height: 60
  }
});

/**
 * A component to render the message detail.
 */
export default class MessageDetailComponent extends React.PureComponent<Props> {
  public render() {
    const {
      message,
      paymentsByRptId,
      potService,
      onServiceLinkPress
    } = this.props;

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderService"),
              department_name: I18n.t("messages.errorLoading.senderInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <View style={styles.mainWrapper}>
        <View style={styles.headerContainer}>
          {/* Service */}
          {service && (
            <Grid style={styles.serviceContainer}>
              <Col>
                <H4>{service.organization_name}</H4>
                <H6 link={true} onPress={onServiceLinkPress}>
                  {service.service_name}
                </H6>
              </Col>
              <Col style={styles.serviceCol}>
                <TouchableOpacity onPress={onServiceLinkPress}>
                  <MultiImage
                    style={styles.serviceMultiImage}
                    source={logosForService(service)}
                  />
                </TouchableOpacity>
              </Col>
            </Grid>
          )}

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <H1>{message.content.subject}</H1>
          </View>

          {/* RawInfo */}
          <MessageDetailRawInfoComponent
            message={message}
            service={service}
            onServiceLinkPress={onServiceLinkPress}
          />
        </View>

        {messageNeedsCTABar(message) && (
          <MessageCTABarComponent
            message={message}
            service={service}
            containerStyle={styles.ctaBarContainer}
            payment={payment}
          />
        )}

        <MessageMarkdown webViewStyle={styles.webview}>
          {message.content.markdown}
        </MessageMarkdown>
      </View>
    );
  }
}
