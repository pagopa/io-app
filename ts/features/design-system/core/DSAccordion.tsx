import {
  AccordionItem,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const assistanceData: Array<AccordionItem> = [
  {
    title: "Come posso pagare su IO?",
    body: "Puoi pagare con carte di debito, credito e prepagate, con PayPal o BANCOMAT Pay."
  },
  {
    title: "Come posso eliminare un metodo di pagamento?",
    body: "I tuoi metodi di pagamento sono visualizzati come card nella parte alta dello schermo del Portafoglio. Seleziona la card del metodo che vuoi eliminare e poi premi 'Elimina questo metodo!"
  },
  {
    title:
      "Nel 2021 ho maturato degli importi che non mi sono ancora stati rimborsati. Cosa posso fare?",
    body: "Probabilmente non hai indicato l'IBAN del conto su cui desideri ricevere l'accredito, oppure quello che hai indicato non è valido.Per inserire l'IBAN o verificarne la correttezza, apri l'app, vai al Portafoglio e premi sulla card del Cashback. Poi, inseriscilo o modificalo e seleziona 'Continua'. Entro 90 giorni riceverai tramite l'app 10 un messaggio sullo stato del rimborso. Le attività tra PagoPA S.p.A. e Consap S.p.A. per i pagamenti dei rimborsi sono in corso di dismissione, quindi, se non inserisci o non correggi l'IBAN entro il 31/07/2022, potrebbe non essere più possibile effettuare il bonifico per il rimborso."
  },
  {
    title: "Come posso eliminare un metodo di pagamento?",
    body: (
      <Body>
        I tuoi metodi di pagamento sono visualizzati come card nella parte alta
        dello schermo del Portafoglio. Seleziona la card del metodo che vuoi
        eliminare e poi premi Elimina questo metodo!
      </Body>
    )
  },
  {
    title:
      "Nel 2021 ho maturato degli importi che non mi sono ancora stati rimborsati. Cosa posso fare?",
    body: "Probabilmente non hai indicato l'IBAN del conto su cui desideri ricevere l'accredito, oppure quello che hai indicato non è valido.Per inserire l'IBAN o verificarne la correttezza, apri l'app, vai al Portafoglio e premi sulla card del Cashback. Poi, inseriscilo o modificalo e seleziona 'Continua'. Entro 90 giorni riceverai tramite l'app 10 un messaggio sullo stato del rimborso. Le attività tra PagoPA S.p.A. e Consap S.p.A. per i pagamenti dei rimborsi sono in corso di dismissione, quindi, se non inserisci o non correggi l'IBAN entro il 31/07/2022, potrebbe non essere più possibile effettuare il bonifico per il rimborso."
  }
];

export const DSAccordion = () => {
  const renderAccordionHeader = () => (
    <View style={{ marginBottom: 24 }}>
      <H3 color={theme["textHeading-default"]}>AccordionItem</H3>
    </View>
  );

  const theme = useIOTheme();

  const renderItem = ({ item }: ListRenderItemInfo<AccordionItem>) => (
    <AccordionItem title={item.title} body={item.body} />
  );

  return (
    <DesignSystemScreen title={"Accordion"}>
      <FlatList
        scrollEnabled={false}
        data={assistanceData}
        contentContainerStyle={{
          flexGrow: 1
        }}
        ListHeaderComponent={renderAccordionHeader}
        ItemSeparatorComponent={() => <VSpacer size={8} />}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={renderItem}
      />
    </DesignSystemScreen>
  );
};
