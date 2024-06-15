import * as React from "react";
import { WalletCardsCategoryContainer } from "../../newWallet/components/WalletCardsCategoryContainer";
import { WalletCard, WalletCardCategory } from "../../newWallet/types";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";

export const DSWallet = () => {
  const cards: ReadonlyArray<WalletCard> = [
    {
      key: "1",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 412.69,
      avatarSource: {
        uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
      },
      expireDate: new Date(),
      name: "18 App"
    },
    {
      key: "2",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "9900",
      brand: "maestro",
      holderName: "Anna Verdi",
      expireDate: new Date()
    },
    {
      key: "4",
      type: "payment",
      category: "payment",
      walletId: "1",
      holderEmail: "anna_v********@**hoo.it"
    },
    {
      key: "2",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "9900",
      brand: "maestro",
      holderName: "Anna Verdi",
      expireDate: new Date(),
      isExpired: true
    }
  ];

  const cardsByCategory = cards.reduce(
    (acc, card) => ({
      ...acc,
      [card.category]: [...(acc[card.category] || []), card]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
  );

  return (
    <DesignSystemScreen title={"Wallet"}>
      <DesignSystemSection title="Single card">
        <WalletCardsCategoryContainer
          label="Iniziative welfare"
          iconName="bonus"
          cards={cardsByCategory.bonus}
        />
      </DesignSystemSection>

      <DesignSystemSection title="Multiple cards">
        <WalletCardsCategoryContainer
          label="Metodi di pagamento"
          iconName="creditCard"
          cards={cardsByCategory.payment}
        />
      </DesignSystemSection>
    </DesignSystemScreen>
  );
};
