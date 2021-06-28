import React, { useState } from "react";
import { connect } from "react-redux";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import { GlobalState } from "../../store/reducers/types";
import EmailSwitchRow from "./EmailSwitchRow";
import PushSwitchRow from "./PushSwitchRow";
import InboxSwitchRow from "./InboxSwitchRow";

type Item = "email" | "push" | "inbox";

type Props = ReturnType<typeof mapStateToProps>;

const ContactPreferencesToggle: React.FC<Props> = (_props: Props) => {
  // data from state
  const isUpdatingProfile = false;
  const profileVersion: NonNegativeInteger = 1 as NonNegativeInteger;

  // functions from actions
  const navigateToEmailPreferences: () => void = () => undefined;
  const onValueChange: (item: Item, value: boolean) => void = (_item, _value) =>
    undefined;

  // local states
  /*
   *  we should find a better representation for the state
   */
  const [inboxSwitched, setInboxSwitched] = useState(true);
  const [pushSwitched, setPushSwitched] = useState(true);
  const [emailSwitched, setEmailSwitched] = useState(true);

  // inbox props, derived or read from state
  const hasInbox = true;
  const onInboxValueChange = (value: boolean) => {
    onValueChange("inbox", value);
    setInboxSwitched(value);
  };

  // push notifications props, derived or read from state
  const hasWebHookChannel = true;

  const onPushValueChange = (value: boolean) => {
    onValueChange("push", value);
    setPushSwitched(value);
  };

  // email props, derived or read from state
  const hasEmailChannel = true;
  const isEmailEnabled = true;
  const isEmailValidated = true;
  const isEmailGloballyDisabled = false;

  const onEmailValueChange = (value: boolean) => {
    onValueChange("email", value);
    setEmailSwitched(value);
  };

  return (
    <>
      {hasInbox && (
        <InboxSwitchRow
          disabled={false}
          locked={false}
          onValueChange={onInboxValueChange}
          switched={inboxSwitched}
          version={profileVersion}
        />
      )}
      {hasWebHookChannel && (
        <PushSwitchRow
          disabled={false}
          locked={false}
          onValueChange={onPushValueChange}
          switched={pushSwitched}
          version={profileVersion}
        />
      )}

      {hasEmailChannel && (
        <EmailSwitchRow
          disabled={false}
          enabled={isEmailEnabled}
          goToPreferences={navigateToEmailPreferences}
          locked={isEmailGloballyDisabled}
          onValueChange={onEmailValueChange}
          showInfoBox={false}
          switched={emailSwitched}
          validated={isEmailValidated}
          version={profileVersion}
        />
      )}
    </>
  );
};

const mapStateToProps = (_state: GlobalState) => {
  return {};
};

export default connect(mapStateToProps)(ContactPreferencesToggle);
