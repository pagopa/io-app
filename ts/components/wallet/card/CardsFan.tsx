import * as React from "react";
import { TouchableOpacity } from "react-native";

import { Wallet } from "../../../types/pagopa";
import { RotatedCards } from "./RotatedCards";

type Props = Readonly<{
  wallets: [Wallet] | [Wallet, Wallet];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => {
  return (
    <TouchableOpacity onPress={props.navigateToWalletList}>
      <RotatedCards cardType="Preview" wallets={props.wallets} />
    </TouchableOpacity>
  );
};

export default CardsFan;
