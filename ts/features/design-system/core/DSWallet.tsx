import * as React from "react";
import { WalletCategoryStackContainer } from "../../newWallet/components/WalletCategoryStackContainer";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { PaymentWalletCard } from "../../payments/common/components/PaymentWalletCard";

export const DSWallet = () => (
  <DesignSystemScreen title={"Wallet"}>
    <WalletCategoryStackContainer
      label="Iniziative welfare"
      iconName="bonus"
      cards={[]}
    />
    <WalletCategoryStackContainer
      label="Metodi di pagamento"
      iconName="creditCard"
      cards={[{ type: "idPay", category: "payment", key: "123" }]}
    />
  </DesignSystemScreen>
);
