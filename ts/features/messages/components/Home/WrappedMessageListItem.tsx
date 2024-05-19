import React, { useEffect, useMemo } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../services/details/store/reducers/servicesById";
import { UIMessage } from "../../types";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { logosForService } from "../../../../utils/services";
import I18n from "../../../../i18n";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { accessibilityLabelForMessageItem } from "./homeUtils";
import { MessageListItem } from "./MessageListItem";

type WrappedMessageListItemProps = {
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  message
}: WrappedMessageListItemProps) => {
  // console.log(`=== WrappedMessageListItem (${message.id})`);
  const dispatch = useIODispatch();
  const serviceId = message.serviceId;
  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));
  const organizationFiscalCode = service?.organization_fiscal_code;
  useEffect(() => {
    // TODO
    if (!organizationFiscalCode) {
      // console.log(`=== WrappedMessageListItem useEffect dispatch`);
      dispatch(loadServiceDetail.request(serviceId));
    }
  }, [dispatch, organizationFiscalCode, serviceId]);

  const serviceLogoUriSources = useMemo(
    () => (service ? logosForService(service) : undefined),
    [service]
  );
  const organizationName =
    message.organizationName || I18n.t("messages.errorLoading.senderInfo");
  const serviceName =
    message.serviceName || I18n.t("messages.errorLoading.serviceInfo");
  const messageTitle = message.title || I18n.t("messages.errorLoading.noTitle");
  const messageDate = convertDateToWordDistance(
    message.createdAt,
    I18n.t("messages.yesterday")
  );
  const isRead = message.isRead;
  const isMessageFromSendService = message.category.tag === TagEnum.PN;
  const accessibilityLabel = useMemo(
    () => accessibilityLabelForMessageItem(message),
    [message]
  );

  return (
    <MessageListItem
      type="loaded"
      accessibilityLabel={accessibilityLabel}
      bodyPrequel={serviceName}
      bodySequel={messageTitle}
      onLongPress={undefined}
      onPress={undefined}
      serviceLogos={serviceLogoUriSources}
      showBadgeAndTag={isMessageFromSendService}
      showCircle={isRead}
      title={organizationName}
      titleTime={messageDate}
    />
  );
};
