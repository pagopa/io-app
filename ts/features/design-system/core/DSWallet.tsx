import { ListItemSwitch } from "@pagopa/io-app-design-system";
import * as React from "react";
import { CredentialType } from "../../itwallet/common/utils/itwMocksUtils";
import { WalletCardsCategoryContainer } from "../../newWallet/components/WalletCardsCategoryContainer";
import { WalletCard, WalletCardCategory } from "../../newWallet/types";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";

export const DSWallet = () => {
  const [isStacked, setStacked] = React.useState(true);

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
      key: "3",
      type: "payment",
      category: "payment",
      walletId: "1",
      holderEmail: "anna_v********@**hoo.it"
    },
    {
      key: "4",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "9900",
      brand: "maestro",
      holderName: "Anna Verdi",
      expireDate: new Date(),
      isExpired: true
    },
    {
      key: "7",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      data: ["Anna Verdi", "A - B"]
    },
    {
      key: "6",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.DRIVING_LICENSE,
      data: ["Anna Verdi", "A - B"]
    },
    {
      key: "5",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.PID,
      data: []
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
        <ListItemSwitch
          label="Show stacked cards"
          value={isStacked}
          onSwitchValueChange={setStacked}
        />
        <WalletCardsCategoryContainer
          label="Metodi di pagamento"
          iconName="creditCard"
          cards={cardsByCategory.payment}
          stacked={isStacked}
        />
        <WalletCardsCategoryContainer
          label="IT Wallet"
          iconName="fiscalCodeIndividual"
          cards={cardsByCategory.itw}
          stacked={isStacked}
        />
      </DesignSystemSection>
    </DesignSystemScreen>
  );
};
