import * as React from "react";
import { Row, Text, View } from "native-base";

import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import Switch from "../../ui/Switch";
import styles from "./styles";

type Props = {
  disabled: boolean;
  enabled: boolean;
  goToPreferences: () => void;
  locked: boolean;
  onValueChange: (value: boolean) => void;
  showInfoBox: boolean;
  switched: boolean;
  validated: boolean;
  version: number;
};

const EmailSwitchRow: React.FC<Props> = ({
  enabled,
  validated,
  onValueChange,
  version,
  goToPreferences,
  showInfoBox,
  switched,
  disabled
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

  const locked = !enabled; // TODO: this  might be a stretch

  return (
    <React.Fragment>
      <Row style={[styles.switchRow, styles.otherSwitchRow]}>
        <View style={styles.flexRow}>
          <Text
            bold={true}
            style={switched ? styles.enabledColor : styles.disabledColor}
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
          disabled={disabled}
          value={switched}
          onValueChange={onValueChange}
          testID={"EmailSwitchRow-switch"}
        />
      </Row>
      {/* TODO: it could be implmented to advise on is_inbox_enabled setting too */}
      {showInfoBox && (
        <Row style={styles.info}>
          <Text testID={"EmailSwitchRow-info"}>
            {`${emailForwardingDescription} `}
            <Text
              link={true}
              onPress={goToPreferences}
              testID={"EmailSwitchRow-info-link"}
            >
              {emailForwardingLink}
            </Text>
          </Text>
        </Row>
      )}
    </React.Fragment>
  );
};

export default EmailSwitchRow;
