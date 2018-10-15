import { View } from "native-base";
import * as React from "react";

import { Wallet } from "../../../types/pagopa";
import { WalletStyles } from "../../styles/wallet";
import CardComponent from "./CardComponent";
import { LogoPosition } from "./Logo";

type Props = Readonly<{
  wallet: Wallet;
}>;

const CardHeader: React.SFC<Props> = props => {
  return (
    <View style={WalletStyles.container}>
      <CardComponent
        wallet={props.wallet}
        logoPosition={LogoPosition.TOP}
        flatBottom={true}
        headerOnly={true}
        rotated={true}
      />
    </View>
  );
};

export default CardHeader;
