/**
 * A function to render a list item about the services email forwarding preferences
 * It displays a lock icon if the email notifications are globally enabled/disabled (from preferences)
 */
import * as React from "react";
import { Row, Text, View } from "native-base";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";

import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import Switch from "../../ui/Switch";
import styles from "./styles";

type Props = {
  enabled: boolean;
  validated: boolean;
  customMailEnabled: boolean;
  onValueChange: (value: boolean) => void;
  version: NonNegativeInteger;
  goToPreferences: () => void;
  locked: boolean;
};

const EmailSwitchRow: React.FC<Props> = ({
  enabled,
  locked,
  validated,
  customMailEnabled,
  onValueChange,
  version,
  goToPreferences
}: Props) => {
  const messageForwardingState = enabled
    ? I18n.t("serviceDetail.enabled")
    : I18n.t("serviceDetail.disabled");

  const emailForwardingDescription = validated
    ? I18n.t("serviceDetail.lockedMailAlert", {
        enabled: messageForwardingState
      })
    : I18n.t("serviceDetail.notValidated");

  const emailForwardingLink = validated
    ? I18n.t("serviceDetail.updatePreferences")
    : I18n.t("serviceDetail.goTo");

  // determine if the switch interaction should be disabled
  const isDisabled =
    // the email is not yet validated
    !validated ||
    // the email channel is disabled
    !enabled ||
    // the user wants all services ON or OFF (no custom choices)
    !customMailEnabled ||
    locked;

  const isSwitchedOn =
    // email is validated
    validated &&
    // the email channel is enabled
    enabled;

  return (
    <React.Fragment>
      <Row style={[styles.switchRow, styles.otherSwitchRow]}>
        <View style={styles.flexRow}>
          <Text
            bold={true}
            style={isSwitchedOn ? styles.enabledColor : styles.disabledColor}
          >
            {I18n.t("services.emailForwarding")}
          </Text>
          {locked && (
            <IconFont
              style={{ marginLeft: 4 }}
              name={"io-lucchetto"}
              color={customVariables.brandDarkGray}
            />
          )}
        </View>
        <Switch
          key={`switch-email-${version}`}
          disabled={isDisabled}
          value={isSwitchedOn}
          onValueChange={onValueChange}
        />
      </Row>
      {/* TODO: it could be implmented to advise on is_inbox_enabled setting too */}
      {(!customMailEnabled || !validated) && (
        <Row style={styles.info}>
          <Text>
            {`${emailForwardingDescription} `}
            <Text link={true} onPress={goToPreferences}>
              {emailForwardingLink}
            </Text>
          </Text>
        </Row>
      )}
    </React.Fragment>
  );
};

export default EmailSwitchRow;
