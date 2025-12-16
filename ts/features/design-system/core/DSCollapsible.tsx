import {
  AccordionItem,
  VSpacer,
  H4,
  useIOTheme,
  Body,
  ClaimsSelector,
  VStack
} from "@pagopa/io-app-design-system";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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

export const DSCollapsible = () => {
  const theme = useIOTheme();

  const renderAccordionHeader = () => (
    <View style={{ marginBottom: 24 }}>
      <H4 color={theme["textHeading-default"]}>AccordionItem</H4>
    </View>
  );

  const renderItem = ({ item }: ListRenderItemInfo<AccordionItem>) => (
    <AccordionItem title={item.title} body={item.body} />
  );

  return (
    <DesignSystemScreen title={"Collapsible"}>
      <VStack space={48}>
        {/* Accordion */}
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

        {/* ClaimsSelector */}
        {renderClaimsSelector()}
      </VStack>
    </DesignSystemScreen>
  );
};

const renderClaimsSelector = () => (
  <VStack space={24}>
    <H4>ClaimsSelector</H4>

    <DSComponentViewerBox name="ClaimsSelector · Default collapsed & unselectable">
      <ClaimsSelector
        defaultExpanded={false}
        selectionEnabled={false}
        title="Patente di guida"
        items={[
          {
            id: "name",
            value: "Mario Rossi",
            description: "Nome e cognome"
          },
          {
            id: "birthplace",
            value: "Roma",
            description: "Luogo di nascita"
          },
          {
            id: "image",
            value:
              "data:image/jpeg;base64,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",
            description: "Fotografia",
            type: "image"
          }
        ]}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ClaimsSelector · Default expanded & selectable">
      <ClaimsSelector
        defaultExpanded
        selectionEnabled
        title="Patente di guida"
        items={[
          {
            id: "name",
            value: "Mario Rossi",
            description: "Nome e cognome"
          },
          {
            id: "birthplace",
            value: "Roma",
            description: "Luogo di nascita"
          },
          {
            id: "birthdate",
            value: "01/01/1970",
            description: "Data di nascita"
          }
        ]}
      />
    </DSComponentViewerBox>
  </VStack>
);
