import * as React from "react";
import { getBottomSpace, isIphoneX } from "react-native-iphone-x-helper";
import DeviceInfo from "react-native-device-info";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import I18n from "../../../../../../i18n";
import { Icon } from "../../../../../../components/core/icons";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";

type Props = { goToTransactions: () => void };

/**
 * Display the transactions button when:
 * - Period is closed and transactions number is > 0
 * - Period is active
 * never displays for inactive/incoming period
 * @param props
 * @constructor
 */
const GoToTransactions: React.FunctionComponent<Props> = props => (
  <ButtonDefaultOpacity
    block={true}
    onPress={props.goToTransactions}
    activeOpacity={1}
    style={{
      marginBottom: isIphoneX()
        ? getBottomSpace()
        : DeviceInfo.hasNotch()
        ? 10
        : 0
    }}
  >
    <Icon name="transactions" size={24} color="white" />
    <HSpacer size={8} />
    <Label color={"white"}>
      {I18n.t("bonus.bpd.details.transaction.goToButton")}
    </Label>
  </ButtonDefaultOpacity>
);

export default GoToTransactions;
