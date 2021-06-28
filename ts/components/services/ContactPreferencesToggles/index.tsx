import React, { useState } from "react";
import { connect } from "react-redux";

import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../store/reducers/types";
import I18n from "../../../i18n";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { NotificationChannelEnum } from "../../../../definitions/backend/NotificationChannel";
import PreferenceToggleRow from "./PreferenceToggleRow";

type Item = "email" | "push" | "inbox";

type Props = {
  channels?: ReadonlyArray<NotificationChannelEnum>;
} & ReturnType<typeof mapStateToProps>;

const ContactPreferencesToggle: React.FC<Props> = (props: Props) => {
  // functions from actions
  const onValueChange: (item: Item, value: boolean) => void = (_item, _value) =>
    undefined;

  /*
   *  TODO State should be removed when data will be available from store
   */
  const [inboxSwitched, setInboxSwitched] = useState(true);
  const [pushSwitched, setPushSwitched] = useState(true);
  const [emailSwitched, setEmailSwitched] = useState(true);

  const onInboxValueChange = (value: boolean) => {
    onValueChange("inbox", value);
    setInboxSwitched(value);
  };

  const hasChannel = (channel: NotificationChannelEnum) =>
    fromNullable(props.channels)
      .map(anc => anc.indexOf(channel) !== -1)
      .getOrElse(true);

  const onPushValueChange = (value: boolean) => {
    onValueChange("push", value);
    setPushSwitched(value);
  };

  const onEmailValueChange = (value: boolean) => {
    onValueChange("email", value);
    setEmailSwitched(value);
  };

  return (
    <>
      <PreferenceToggleRow
        label={
          inboxSwitched
            ? I18n.t("services.serviceIsEnabled")
            : I18n.t("services.serviceNotEnabled")
        }
        onPress={onInboxValueChange}
        value={inboxSwitched}
      />
      <ItemSeparatorComponent noPadded />
      {hasChannel(NotificationChannelEnum.WEBHOOK) && (
        <>
          <PreferenceToggleRow
            label={I18n.t("services.pushNotifications")}
            onPress={onPushValueChange}
            value={pushSwitched}
          />
          <ItemSeparatorComponent noPadded />
        </>
      )}

      {hasChannel(NotificationChannelEnum.EMAIL) && (
        <>
          <PreferenceToggleRow
            label={I18n.t("services.emailForwarding")}
            onPress={onEmailValueChange}
            value={emailSwitched}
          />
          <ItemSeparatorComponent noPadded />
        </>
      )}
    </>
  );
};

const mapStateToProps = (_state: GlobalState) => ({});

export default connect(mapStateToProps)(ContactPreferencesToggle);
