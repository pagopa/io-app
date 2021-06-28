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

const InboxSwitchRow: React.FC<Props> = ({
  onValueChange,
  version,
  switched,
  disabled
}) => (
  <Row style={styles.switchRow}>
    <Text
      bold={true}
      style={switched ? styles.enabledColor : styles.disabledColor}
    >
      {switched
        ? I18n.t("services.serviceIsEnabled")
        : I18n.t("services.serviceNotEnabled")}
    </Text>
    <Switch
      key={`switch-inbox-${version}}`}
      value={switched}
      disabled={disabled}
      onValueChange={onValueChange}
      testID={"InboxSwitchRow-switch"}
    />
  </Row>
);

export default InboxSwitchRow;
