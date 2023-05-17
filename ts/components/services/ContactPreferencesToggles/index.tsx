import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIsFocused } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { NotificationChannelEnum } from "../../../../definitions/backend/NotificationChannel";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../store/actions/services/servicePreference";
import { Dispatch } from "../../../store/actions/types";
import { useIOSelector } from "../../../store/hooks";
import { isPremiumMessagesOptInOutEnabledSelector } from "../../../store/reducers/backendStatus";
import {
  servicePreferenceSelector,
  ServicePreferenceState
} from "../../../store/reducers/entities/services/servicePreference";
import { GlobalState } from "../../../store/reducers/types";
import {
  isServicePreferenceResponseSuccess,
  ServicePreference
} from "../../../types/services/ServicePreferenceResponse";
import { isStrictSome } from "../../../utils/pot";
import { showToast } from "../../../utils/showToast";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import SectionHeader from "../SectionHeader";
import PreferenceToggleRow from "./PreferenceToggleRow";

type Item = "email" | "push" | "inbox" | "can_access_message_read_status";

type Props = {
  channels?: ReadonlyArray<NotificationChannelEnum>;
  serviceId: ServiceId;
  isSpecialService: boolean;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const hasChannel = (
  channel: NotificationChannelEnum,
  channels?: ReadonlyArray<NotificationChannelEnum>
) =>
  pipe(
    channels,
    O.fromNullable,
    O.map(anc => anc.indexOf(channel) !== -1),
    O.getOrElse(() => true)
  );

/**
 * Utility function to get the user preference value for a specific channel
 * return false if preference state is pot.none or if an error occurred on API Response
 * */
const getChannelPreference = (
  potServicePreference: ServicePreferenceState,
  key: Item
): boolean => {
  if (
    pot.isSome(potServicePreference) &&
    isServicePreferenceResponseSuccess(potServicePreference.value)
  ) {
    return potServicePreference.value.value[key];
  }
  return false;
};

const ContactPreferencesToggle: React.FC<Props> = (props: Props) => {
  const { isLoading, isError } = props;
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { serviceId, loadServicePreference } = props;

  const loadPreferences = useCallback(
    () => loadServicePreference(serviceId),
    [serviceId, loadServicePreference]
  );

  const isFocused = useIsFocused();

  const isPremiumMessagesOptInOutEnabled = useIOSelector(
    isPremiumMessagesOptInOutEnabledSelector
  );

  useEffect(() => {
    loadPreferences();
  }, [serviceId, loadPreferences, isFocused]);

  useEffect(() => {
    if (!isFirstRender) {
      if (isError) {
        showToast(I18n.t("global.genericError"));
      }
    } else {
      setIsFirstRender(false);
    }
  }, [isError, isFirstRender]);

  const onValueChange = (value: boolean, type: Item) => {
    if (
      isStrictSome(props.servicePreferenceStatus) &&
      isServicePreferenceResponseSuccess(props.servicePreferenceStatus.value)
    ) {
      props.upsertServicePreference(props.serviceId, {
        ...props.servicePreferenceStatus.value.value,
        [type]: value
      });
    }
  };

  const graphicalState = useMemo(
    () => (isLoading ? "loading" : isError ? "error" : "ready"),
    [isLoading, isError]
  );

  return (
    <>
      <SectionHeader
        iconName="legEmail"
        title={"serviceDetail.contacts.title"}
      />
      {/*
        This Toggle is disabled if the current service is a Special Service cause user can
        enable or disable the service only using the proper Special Service flow and not only tapping the specific toggle
      */}
      <PreferenceToggleRow
        label={I18n.t("services.serviceIsEnabled")}
        onPress={(value: boolean) => onValueChange(value, "inbox")}
        disabled={props.isSpecialService}
        graphicalState={graphicalState}
        onReload={loadPreferences}
        value={getChannelPreference(props.servicePreferenceStatus, "inbox")}
        testID={"contact-preferences-inbox-switch"}
      />
      <ItemSeparatorComponent noPadded />
      {hasChannel(NotificationChannelEnum.WEBHOOK, props.channels) &&
        getChannelPreference(props.servicePreferenceStatus, "inbox") && (
          // toggle is disabled if the inbox value is false to prevent inconsistent data
          <>
            <PreferenceToggleRow
              label={I18n.t("services.pushNotifications")}
              onPress={(value: boolean) => onValueChange(value, "push")}
              value={getChannelPreference(
                props.servicePreferenceStatus,
                "push"
              )}
              graphicalState={graphicalState}
              onReload={loadPreferences}
              testID={"contact-preferences-webhook-switch"}
            />
            <ItemSeparatorComponent noPadded />
          </>
        )}
      {isPremiumMessagesOptInOutEnabled &&
        getChannelPreference(props.servicePreferenceStatus, "inbox") && (
          // toggle is disabled if the inbox value is false to prevent inconsistent data
          <>
            <PreferenceToggleRow
              label={I18n.t("services.messageReadStatus")}
              onPress={(value: boolean) =>
                onValueChange(value, "can_access_message_read_status")
              }
              value={getChannelPreference(
                props.servicePreferenceStatus,
                "can_access_message_read_status"
              )}
              graphicalState={graphicalState}
              onReload={loadPreferences}
              testID={"contact-preferences-trackSeen-switch"}
            />
            <ItemSeparatorComponent noPadded />
          </>
        )}

      {/* Email toggle is temporary removed until the feature will be enabled back from the backend */}
      {/* TODO this option should be reintegrated once option will supported back from backend https://pagopa.atlassian.net/browse/IARS-17 */}
      {/* {hasChannel(NotificationChannelEnum.EMAIL, props.channels) && getChannelPreference(props.servicePreferenceStatus, "inbox") && ( */}
      {/*  <> */}
      {/*    <PreferenceToggleRow */}
      {/*      label={I18n.t("services.emailForwarding")} */}
      {/*      onPress={(value: boolean) => onValueChange(value, "email")} */}
      {/*      value={getChannelPreference(props.servicePreferenceStatus, "email")} */}
      {/*      graphicalState={graphicalState} */}
      {/*      isError={isError} */}
      {/*      testID={"contact-preferences-email-switch"} */}
      {/*    /> */}
      {/*    <ItemSeparatorComponent noPadded /> */}
      {/*  </> */}
      {/* )} */}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const servicePreferenceStatus = servicePreferenceSelector(state);
  const isLoading =
    pot.isLoading(servicePreferenceStatus) ||
    pot.isUpdating(servicePreferenceStatus);

  const isError =
    pot.isError(servicePreferenceStatus) ||
    (isStrictSome(servicePreferenceStatus) &&
      servicePreferenceStatus.value.kind !== "success");

  return {
    isLoading,
    isError,
    servicePreferenceStatus
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  upsertServicePreference: (id: ServiceId, sp: ServicePreference) =>
    dispatch(upsertServicePreference.request({ id, ...sp })),
  loadServicePreference: (id: ServiceId) =>
    dispatch(loadServicePreference.request(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactPreferencesToggle);
