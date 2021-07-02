import * as pot from "italia-ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../store/reducers/types";
import I18n from "../../../i18n";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { NotificationChannelEnum } from "../../../../definitions/backend/NotificationChannel";
import { Dispatch } from "../../../store/actions/types";
import {
  servicePreferenceSelector,
  ServicePreferenceState
} from "../../../store/reducers/entities/services/servicePreference";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../store/actions/services/servicePreference";
import { serviceIDCurrentSelector } from "../../../store/reducers/entities/services/currentService";
import {
  isServicePreferenceResponseSuccess,
  ServicePreference
} from "../../../types/services/ServicePreferenceResponse";
import { isStrictSome } from "../../../utils/pot";
import { showToast } from "../../../utils/showToast";
import PreferenceToggleRow from "./PreferenceToggleRow";

type Item = "email" | "push" | "inbox";

type Props = {
  channels?: ReadonlyArray<NotificationChannelEnum>;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const hasChannel = (
  channel: NotificationChannelEnum,
  channels?: ReadonlyArray<NotificationChannelEnum>
) =>
  fromNullable(channels)
    .map(anc => anc.indexOf(channel) !== -1)
    .getOrElse(true);

const ContactPreferencesToggle: React.FC<Props> = (props: Props) => {
  const { isLoading, isError } = props;
  const [isFirstRender, setIsFirstRender] = useState(true);

  const loadPreferences = () => {
    if (props.currentService !== null) {
      props.loadServicePreference(props.currentService.serviceID);
    }
  };

  useEffect(loadPreferences, []);

  useEffect(() => {
    if (!isFirstRender) {
      if (isError) {
        showToast(I18n.t("global.genericError"));
      }
    } else {
      setIsFirstRender(false);
    }
  }, [isError]);

  const onValueChange = (value: boolean, type: Item) => {
    if (
      isStrictSome(props.servicePreferenceStatus) &&
      isServicePreferenceResponseSuccess(props.servicePreferenceStatus.value) &&
      props.currentService !== null
    ) {
      props.upsertServicePreference(props.currentService.serviceID, {
        ...props.servicePreferenceStatus.value.value,
        [type]: value
      });
    }
  };

  const getValueOrFalse = (
    potServicePreference: ServicePreferenceState,
    key: Item
  ): boolean => {
    if (
      isStrictSome(potServicePreference) &&
      isServicePreferenceResponseSuccess(potServicePreference.value)
    ) {
      return potServicePreference.value.value[key];
    }
    return false;
  };

  return (
    <>
      <PreferenceToggleRow
        label={
          getValueOrFalse(props.servicePreferenceStatus, "inbox")
            ? I18n.t("services.serviceIsEnabled")
            : I18n.t("services.serviceNotEnabled")
        }
        onPress={(value: boolean) => onValueChange(value, "inbox")}
        isLoading={isLoading}
        isError={isError}
        onReload={loadPreferences}
        value={getValueOrFalse(props.servicePreferenceStatus, "inbox")}
        testID={"contact-preferences-inbox-switch"}
      />
      <ItemSeparatorComponent noPadded />
      {hasChannel(NotificationChannelEnum.WEBHOOK, props.channels) && (
        // toggle is disabled if the inbox value is false to prevent inconsistent data
        <>
          <PreferenceToggleRow
            label={I18n.t("services.pushNotifications")}
            onPress={(value: boolean) => onValueChange(value, "push")}
            value={getValueOrFalse(props.servicePreferenceStatus, "push")}
            isLoading={isLoading}
            isError={isError}
            disabled={!getValueOrFalse(props.servicePreferenceStatus, "inbox")}
            onReload={loadPreferences}
            testID={"contact-preferences-webhook-switch"}
          />
          <ItemSeparatorComponent noPadded />
        </>
      )}

      {/* Email toggle is temporary removed until the feature will be enabled back from the backend */}
      {/* {hasChannel(NotificationChannelEnum.EMAIL, props.channels) && ( */}
      {/*  <> */}
      {/*    <PreferenceToggleRow */}
      {/*      label={I18n.t("services.emailForwarding")} */}
      {/*      onPress={(value: boolean) => onValueChange(value, "email")} */}
      {/*      value={getValueOrFalse(props.servicePreferenceStatus, "email")} */}
      {/*      onReload={loadPreferences} */}
      {/*      isLoading={isLoading} */}
      {/*      isError={isError} */}
      {/*      disabled={!getValueOrFalse(props.servicePreferenceStatus, "inbox")} */}
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
    servicePreferenceStatus,
    currentService: serviceIDCurrentSelector(state)
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
