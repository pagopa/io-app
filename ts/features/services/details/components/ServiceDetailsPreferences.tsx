import React, { ComponentProps, useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOStyles,
  IOToast,
  ListItemHeader,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { NotificationChannelEnum } from "../../../../../definitions/backend/NotificationChannel";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPremiumMessagesOptInOutEnabledSelector } from "../../../../store/reducers/backendStatus";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { EnabledChannels } from "../../../../utils/profile";
import * as analytics from "../../common/analytics";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { upsertServicePreference } from "../store/actions/preference";
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
  const isFirstRender = useFirstRender();

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

  useOnFirstRender(
    () => {
      analytics.trackServiceDetailsConsent({
        is_special_service: serviceMetadataInfo.isSpecialService,
        main_consent_status:
          servicePreferenceResponseSuccess?.value.inbox ?? false,
        push_consent_status:
          servicePreferenceResponseSuccess?.value.push ?? false,
        read_confirmation_consent_status:
          servicePreferenceResponseSuccess?.value
            .can_access_message_read_status ?? false,
        service_id: serviceId
      });
    },
    () => !!servicePreferenceResponseSuccess
  );

  useEffect(() => {
    if (!isFirstRender && isErrorServicePreference) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isErrorServicePreference]);

  const handleSwitchValueChange = useCallback(
    (channel: keyof EnabledChannels, value: boolean) => {
      if (servicePreferenceResponseSuccess) {
        analytics.trackServiceConsentChanged({
          consent_status: value,
          consent_type: channel,
          service_id: serviceId
        });

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
      disabled: serviceMetadataInfo.isSpecialService,
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
      contentContainerStyle={IOStyles.horizontalContentPadding}
      data={filteredPreferenceListItems}
      keyExtractor={item => item.label}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
