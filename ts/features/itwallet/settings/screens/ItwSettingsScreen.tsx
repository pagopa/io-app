import {
  Banner,
  Body,
  ContentWrapper,
  VStack
} from "@pagopa/io-app-design-system";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

const title = "IT-Wallet";
const content = `###### Quali sono i vantaggi di IT-Wallet?\n IT-Wallet permette funzionalità evolute e ancora più sicure per i tuoi documenti, con nuovi vantaggi e possibilità.\n
Qualche esempio?\n
- Usi la tua Patente digitale come documento di riconoscimento
- Nuovi documenti disponibili in arrivo
- Ti autentichi in pochi tocchi ai servizi digitali della PA
- Verifichi i documenti tramite codice QR
Ottieni ora IT-Wallet: ti basta la tua Carta di Identità Elettronica (CIE).`;

const ItwSettingsScreen = () => {
  const isItwValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: title }}
      actions={{
        type: "SingleButton",
        primary: {
          label: "Ottieni IT-Wallet",
          accessibilityLabel: "Ottieni IT-Wallet",
          onPress: () => {}
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <Body>Qui puoi gestire il tuo portafoglio digitale.</Body>
          <IOMarkdown content={content} />
          <Banner
            color="neutral"
            pictogramName="idea"
            content="Vuoi saperne di più?"
            action="Visita il sito di IT-Wallet"
            onPress={() => {}}
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export { ItwSettingsScreen };
