import React, { ComponentProps, useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOToast,
  ListItemHeader,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { NotificationChannelEnum } from "../../../../definitions/backend/NotificationChannel";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isPremiumMessagesOptInOutEnabledSelector } from "../../../store/reducers/backendStatus";
import { EnabledChannels } from "../../../utils/profile";
import { useFirstEffect } from "../common/hooks/useFirstEffect";
import { upsertServicePreference } from "../store/actions";
import {
  isErrorServicePreferenceSelector,
  isLoadingServicePreferenceSelector,
  servicePreferenceResponseSuccessSelector
} from "../store/reducers/servicePreference";
import { serviceMetadataInfoSelector } from "../store/reducers/servicesById";

const hasChannel = (
  notificationChannel: NotificationChannelEnum,
  channels: ReadonlyArray<NotificationChannelEnum> = []
) =>
  pipe(
    channels,
    RA.findFirst(channel => channel === notificationChannel),
    O.isSome
  );

type PreferenceSwitchListItem = {
  condition?: boolean;
} & ComponentProps<typeof ListItemSwitch>;

export type ServiceDetailsPreferencesProps = {
  serviceId: ServiceId;
  availableChannels?: ReadonlyArray<NotificationChannelEnum>;
};

export const ServiceDetailsPreferences = ({
  serviceId,
  availableChannels = []
}: ServiceDetailsPreferencesProps) => {
  const isFirstRender = useFirstEffect();

  const dispatch = useIODispatch();

  const servicePreferenceResponseSuccess = useIOSelector(
    servicePreferenceResponseSuccessSelector
  );

  const isLoadingServicePreference = useIOSelector(
    isLoadingServicePreferenceSelector
  );

  const isErrorServicePreference = useIOSelector(
    isErrorServicePreferenceSelector
  );

  const isPremiumMessagesOptInOutEnabled = useIOSelector(
    isPremiumMessagesOptInOutEnabledSelector
  );

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, serviceId)
  );

  const isInboxPreferenceEnabled =
    servicePreferenceResponseSuccess?.value.inbox ?? false;

  useEffect(() => {
    if (!isFirstRender && isErrorServicePreference) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isErrorServicePreference]);

  const handleSwitchValueChange = useCallback(
    (channel: keyof EnabledChannels, value: boolean) => {
      if (servicePreferenceResponseSuccess) {
        dispatch(
          upsertServicePreference.request({
            id: serviceId,
            ...servicePreferenceResponseSuccess.value,
            [channel]: value
          })
        );
      }
    },
    [dispatch, serviceId, servicePreferenceResponseSuccess]
  );

  const preferenceListItems: ReadonlyArray<PreferenceSwitchListItem> = [
    // this switch is disabled if the current service is a special service.
    // the user can enable the service only using the proper special service flow.
    {
      disabled: serviceMetadataInfo?.isSpecialService,
      icon: "message",
      isLoading: isLoadingServicePreference,
      label: I18n.t("services.details.preferences.inbox"),
      onSwitchValueChange: (value: boolean) =>
        handleSwitchValueChange("inbox", value),
      value: servicePreferenceResponseSuccess?.value.inbox
    },
    {
      condition:
        isInboxPreferenceEnabled &&
        hasChannel(NotificationChannelEnum.WEBHOOK, availableChannels),
      icon: "bell",
      isLoading: isLoadingServicePreference,
      label: I18n.t("services.details.preferences.pushNotifications"),
      onSwitchValueChange: (value: boolean) =>
        handleSwitchValueChange("push", value),
      value: servicePreferenceResponseSuccess?.value.push
    },
    {
      condition: isInboxPreferenceEnabled && isPremiumMessagesOptInOutEnabled,
      icon: "read",
      isLoading: isLoadingServicePreference,
      label: I18n.t("services.details.preferences.messageReadStatus"),
      onSwitchValueChange: (value: boolean) =>
        handleSwitchValueChange("can_access_message_read_status", value),
      value:
        servicePreferenceResponseSuccess?.value.can_access_message_read_status
    }
  ];

  const filteredPreferenceListItems = preferenceListItems.filter(
    item => item.condition !== false
  );

  const renderItem = useCallback(
    ({
      item: { condition, ...rest }
    }: ListRenderItemInfo<PreferenceSwitchListItem>) => (
      <ListItemSwitch {...rest} />
    ),
    []
  );

  return (
    <FlatList
      ListHeaderComponent={
        <ListItemHeader label={I18n.t("services.details.preferences.title")} />
      }
      ItemSeparatorComponent={() => <Divider />}
      data={filteredPreferenceListItems}
      keyExtractor={item => item.label}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
