import React, { useEffect, useMemo } from "react";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../services/details/store/reducers/servicesById";
import { UIMessage } from "../../types";
import { logosForService } from "../../../../utils/services";
import I18n from "../../../../i18n";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import {
  accessibilityLabelForMessageItem,
  getLoadServiceDetailsActionIfNeeded
} from "./homeUtils";
import { MessageListItem } from "./DS/MessageListItem";

type WrappedMessageListItemProps = {
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  message
}: WrappedMessageListItemProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const serviceId = message.serviceId;
  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));
  const organizationFiscalCode = service?.organization_fiscal_code;
  useEffect(() => {
    const state = store.getState();
    const loadServiceDetailsActionOrUndefined =
      getLoadServiceDetailsActionIfNeeded(
        state,
        serviceId,
        organizationFiscalCode
      );
    if (loadServiceDetailsActionOrUndefined) {
      dispatch(loadServiceDetailsActionOrUndefined);
    }
  }, [dispatch, organizationFiscalCode, serviceId, store]);

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
  const badgeText =
    message.category.tag === TagEnum.PN
      ? I18n.t("features.pn.details.badge.legalValue")
      : undefined;
  const accessibilityLabel = useMemo(
    () => accessibilityLabelForMessageItem(message),
    [message]
  );

  return (
    <MessageListItem
      accessibilityLabel={accessibilityLabel}
      serviceName={serviceName}
      messageTitle={messageTitle}
      onLongPress={() => undefined}
      onPress={() => undefined}
      serviceLogos={serviceLogoUriSources}
      badgeText={badgeText}
      isRead={isRead}
      organizationName={organizationName}
      formattedDate={messageDate}
    />
  );
};
