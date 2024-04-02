import React, { useCallback, useEffect } from "react";
import { Divider, IOToast, ListItemHeader } from "@pagopa/io-app-design-system";
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
  servicePreferenceResponseSuccessSelector
} from "../store/reducers/servicePreference";
import { serviceMetadataInfoSelector } from "../store/reducers/servicesById";
import { ServicePreferenceListItemSwitch } from "./ServicePreferenceListItemSwitch";

const hasChannel = (
  notificationChannel: NotificationChannelEnum,
  channels: ReadonlyArray<NotificationChannelEnum> = []
) =>
  pipe(
    channels,
    RA.findFirst(channel => channel === notificationChannel),
    O.isSome
  );

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

  const isErrorServicePreference = useIOSelector(
    isErrorServicePreferenceSelector
  );

  const isPremiumMessagesOptInOutEnabled = useIOSelector(
    isPremiumMessagesOptInOutEnabledSelector
  );

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, serviceId)
  );

  const isInboxPreferenceEnabled = pipe(
    servicePreferenceResponseSuccess,
    O.fromNullable,
    O.map(servicePreference => servicePreference.value.inbox),
    O.getOrElse(() => false)
  );

  useEffect(() => {
    if (!isFirstRender && isErrorServicePreference) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isErrorServicePreference]);

  const handlePreferenceValueChange = useCallback(
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

  return (
    <>
      <ListItemHeader
        label={I18n.t("services.details.preferences.title")}
        accessibilityLabel={I18n.t("services.details.preferences.title")}
      />
      {/* 
        this switch is disabled if the current service is a special service.
        the user can enable the service only using the proper special service flow.
      */}
      <ServicePreferenceListItemSwitch
        channel="inbox"
        icon="message"
        disabled={serviceMetadataInfo?.isSpecialService}
        label={I18n.t("services.details.preferences.inbox")}
        onPreferenceValueChange={(value: boolean) =>
          handlePreferenceValueChange("inbox", value)
        }
      />

      {isInboxPreferenceEnabled ? (
        <>
          {hasChannel(NotificationChannelEnum.WEBHOOK, availableChannels) && (
            <>
              <Divider />
              <ServicePreferenceListItemSwitch
                channel="push"
                icon="bell"
                label={I18n.t("services.details.preferences.pushNotifications")}
                onPreferenceValueChange={(value: boolean) =>
                  handlePreferenceValueChange("push", value)
                }
              />
            </>
          )}

          {isPremiumMessagesOptInOutEnabled && (
            <>
              <Divider />
              <ServicePreferenceListItemSwitch
                channel="can_access_message_read_status"
                icon="read"
                label={I18n.t("services.details.preferences.messageReadStatus")}
                onPreferenceValueChange={(value: boolean) =>
                  handlePreferenceValueChange(
                    "can_access_message_read_status",
                    value
                  )
                }
              />
            </>
          )}
        </>
      ) : null}
    </>
  );
};
