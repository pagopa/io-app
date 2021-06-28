import * as React from "react";
import { Row, Text } from "native-base";

import I18n from "../../../i18n";
import Switch from "../../ui/Switch";
import styles from "./styles";

type Props = {
  disabled: boolean;
  locked: boolean;
  onValueChange: (value: boolean) => void;
  switched: boolean;
  version: number;
};

const PushSwitchRow: React.FC<Props> = ({
  onValueChange,
  version,
  switched,
  disabled
}) => (
  <Row style={[styles.switchRow, styles.otherSwitchRow]}>
    <Text
      bold={true}
      style={switched ? styles.enabledColor : styles.disabledColor}
    >
      {I18n.t("services.pushNotifications")}
    </Text>
    <Switch
      key={`switch-push-${version}`}
      value={switched}
      disabled={disabled}
      testID={"PushSwitchRow-switch"}
      onValueChange={onValueChange}
    />
  </Row>
);

export default PushSwitchRow;
