import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";

import { GlobalState } from "../../../store/reducers/types";
import I18n from "../../../i18n";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { NotificationChannelEnum } from "../../../../definitions/backend/NotificationChannel";
import { Dispatch } from "../../../store/actions/types";
import { servicePreferenceSelectorValue } from "../../../store/reducers/entities/services/servicePreference";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../store/actions/services/servicePreference";
import { serviceIDCurrentSelector } from "../../../store/reducers/entities/services/currentService";
import { ServicePreference } from "../../../types/services/ServicePreferenceResponse";
import PreferenceToggleRow from "./PreferenceToggleRow";

type Item = "email" | "push" | "inbox";

type Props = {
  channels?: ReadonlyArray<NotificationChannelEnum>;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// eslint-disable-next-line sonarjs/cognitive-complexity
const ContactPreferencesToggle: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    if (props.currentService !== null) {
      props.loadServicePreference(props.currentService.serviceID);
    }
  }, []);

  const onValueChange = (value: boolean, type: Item) => {
    if (
      props.servicePreference &&
      props.servicePreference.kind === "success" &&
      props.currentService !== null
    ) {
      switch (type) {
        case "inbox":
          props.upsertServicePreference(props.currentService.serviceID, {
            inbox: value,
            push: value ? props.servicePreference.value.push : false,
            email: value ? props.servicePreference.value.email : false,
            settings_version: props.servicePreference.value.settings_version
          });
          return;
        case "push":
          props.upsertServicePreference(props.currentService.serviceID, {
            inbox: props.servicePreference.value.inbox,
            push: value,
            email: props.servicePreference.value.email,
            settings_version: props.servicePreference.value.settings_version
          });
          return;
        case "email":
          props.upsertServicePreference(props.currentService.serviceID, {
            inbox: props.servicePreference.value.inbox,
            push: props.servicePreference.value.push,
            email: value,
            settings_version: props.servicePreference.value.settings_version
          });
          return;
      }
    }
  };

  const hasChannel = (channel: NotificationChannelEnum) =>
    fromNullable(props.channels)
      .map(anc => anc.indexOf(channel) !== -1)
      .getOrElse(true);

  return props.servicePreference &&
    props.servicePreference.kind === "success" ? (
    <>
      <PreferenceToggleRow
        label={
          props.servicePreference.value.inbox
            ? I18n.t("services.serviceIsEnabled")
            : I18n.t("services.serviceNotEnabled")
        }
        onPress={(value: boolean) => onValueChange(value, "inbox")}
        isLoading={true}
        isError={false}
        value={props.servicePreference?.value.inbox}
        testID={"contact-preferences-inbox-switch"}
      />
      <ItemSeparatorComponent noPadded />
      {hasChannel(NotificationChannelEnum.WEBHOOK) && (
        <>
          <PreferenceToggleRow
            label={I18n.t("services.pushNotifications")}
            onPress={(value: boolean) => onValueChange(value, "push")}
            value={props.servicePreference.value.push}
            isLoading={false}
            isError={true}
            testID={"contact-preferences-webhook-switch"}
          />
          <ItemSeparatorComponent noPadded />
        </>
      )}

      {/* {hasChannel(NotificationChannelEnum.EMAIL) && ( */}
      {/*  <> */}
      {/*    <PreferenceToggleRow */}
      {/*      label={I18n.t("services.emailForwarding")} */}
      {/*      onPress={(value: boolean) => onValueChange(value, "email")} */}
      {/*      value={emailSwitched} */}
      {/*      testID={"contact-preferences-email-switch"} */}
      {/*    /> */}
      {/*    <ItemSeparatorComponent noPadded /> */}
      {/*  </> */}
      {/* )} */}
    </>
  ) : (
    <></>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  servicePreference: servicePreferenceSelectorValue(state),
  currentService: serviceIDCurrentSelector(state)
});

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
