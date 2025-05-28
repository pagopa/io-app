import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

const spidErrorCodeTable = new Map<string, string>([
  ["1", "Autenticazione corretta"],
  ["2", "Indisponibilità sistema"],
  ["3", "Errore di sistema"],
  ["4", "Formato binding non corretto"],
  ["5", "Verifica della firma fallita"],
  ["6", "Binding su metodo HTTP errato"],
  ["7", "Errore sulla verifica della firma della richiesta"],
  ["8", "Formato della richiesta non conforme alle specifiche SAML"],
  ["9", "Parametro version non presente, malformato o diverso da  ‘2.0’"],
  [
    "10",
    "Issuer non presente, malformato o non corrispondete all'entità che sottoscrive la richiesta"
  ],
  [
    "11",
    "ID (Identificatore richiesta)  non presente, malformato o non conforme"
  ],
  [
    "12",
    "RequestAuthnContext non presente, malformato  o non previsto da SPID"
  ],
  [
    "13",
    "IssueInstant non presente, malformato o non coerente con l'orario di arrivo della richiesta"
  ],
  [
    "14",
    "destination non presente, malformata o non coincidente con ill Gestore delle identità ricevente la richiesta"
  ],
  ["15", "attributo isPassivepresente e attualizzato al valore true"],
  ["16", "AssertionConsumerServicenon correttamente valorizzato "],
  [
    "17",
    "Attributo Formatdell'elemento NameIDPolicy assente o non valorizzato secondo specifica"
  ],
  [
    "18",
    "AttributeConsumerServiceIndex malformato o che riferisce a un valore non registrato nei metadati di SP"
  ],
  [
    "19",
    "Autenticazione fallita per ripetuta sottomissione di credenziali errate (superato numero  tentativi secondo le policy adottate) "
  ],
  [
    "20",
    "Utente privo di credenziali compatibili con il livello richiesto dal fornitore del servizio "
  ],
  ["21", "Timeout durante l’autenticazione utente"],
  [
    "22",
    "Utente nega il consenso all’invio di dati al SP in caso di sessione vigente "
  ],
  ["23", "Utente con identità sospesa/revocata o con credenziali bloccate "],
  ["25", "Processo di autenticazione annullato dall’utente"],
  ["26", "Processo di erogazione dell’identità digitale andata a buon fine"],
  ["27", "Utente già presente"],
  ["28", "Operazione annullata"],
  ["29", "Identità non erogata"],
  ["1001", "Cittadino minore di 14 anni"],
  ["1002", "Utente con identità bloccata da ioapp.it"]
]);

export const getSpidErrorCodeDescription = (errorCode: string) =>
  pipe(
    spidErrorCodeTable.get(errorCode),
    O.fromNullable,
    O.getOrElse(() => "N/A")
  );
