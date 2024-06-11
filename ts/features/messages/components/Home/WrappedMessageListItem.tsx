import React, { useCallback, useEffect, useMemo } from "react";
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
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import {
  accessibilityLabelForMessageItem,
  getLoadServiceDetailsActionIfNeeded
} from "./homeUtils";
import { MessageListItem } from "./DS/MessageListItem";

type WrappedMessageListItemProps = {
  index: number;
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  index,
  message
}: WrappedMessageListItemProps) => {
  const navigation = useIONavigation();
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

  const onPressCallback = useCallback(() => {
    if (message.category.tag === TagEnum.PN || message.hasPrecondition) {
      // TODO preconditions IOCOM-840
      return;
    }
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
      params: {
        messageId: message.id,
        fromNotification: false
      }
    });
  }, [message, navigation]);

  return (
    <MessageListItem
      accessibilityLabel={accessibilityLabel}
      serviceName={serviceName}
      messageTitle={messageTitle}
      onLongPress={() => undefined}
      onPress={onPressCallback}
      serviceLogos={serviceLogoUriSources}
      badgeText={badgeText}
      isRead={isRead}
      organizationName={organizationName}
      formattedDate={messageDate}
      testID={`wrapped_message_list_item_${index}`}
    />
  );
};
