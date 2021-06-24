import React from "react";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import EmailSwitchRow from "./EmailSwitchRow";

type Item = "email";

type Props = {
  navigateToEmailPreferences: () => void;
  profileVersion: NonNegativeInteger;
  onValueChange: (item: Item, value: boolean) => void;
};

const ContactPreferencesToggle: React.FC<Props> = ({
  navigateToEmailPreferences,
  profileVersion,
  onValueChange
}) => {
  // channel and globally
  // || the profile is loading pot.isUpdating(this.props.profile);
  // this.state.uiEnabledChannels.inbox &&
  //  (!customMailEnabled ||
  //    // if the user has done custom choices check if the current channel is enabled or not
  //    (customMailEnabled && this.state.uiEnabledChannels.email)) &&
  const isEmailEnabled = true;
  const showEmail = true;
  const isEmailValidated = true;
  const isCustomEmailChannelEnabled = true;
  const isEmailGloballyDisabled = false;

  const onEmailValueChange = (value: boolean) => {
    onValueChange("email", value);
  };

  return (
    <>
      {showEmail && (
        <EmailSwitchRow
          validated={isEmailValidated}
          customMailEnabled={isCustomEmailChannelEnabled}
          onValueChange={onEmailValueChange}
          version={profileVersion}
          goToPreferences={navigateToEmailPreferences}
          enabled={isEmailEnabled}
          locked={isEmailGloballyDisabled}
        />
      )}
    </>
  );
};

export default ContactPreferencesToggle;
