import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import { ID_BONUS_VACANZE_TYPE } from "../utils/bonus";

const contentBonusVacanze = `#### Chi può richiederlo?

Il bonus è destinato a tutte le famiglie italiane con un reddito familiare ISEE inferiore a 40.000€.

#### Quanto vale?
Il valore del bonus cambia in base al numero di componenti del nucleo familiare:
- 150€ per un solo componente; 
- 300€ per due componenti; 
- 500€ per più di due componenti.

L’incentivo può essere paragonato a uno sconto pari all’80% del valore del bonus, che viene applicato dalla struttura turistica al momento del pagamento della vacanza. Il restante 20% sarà fruito in forma di detrazione fiscale in fase di dichiarazione dei redditi.

#### Chi, dove e quando può spenderlo?
Ciascun membro del nucleo famigliare può usufruire del bonus. Il bonus vacanze è spendibile in un’unica soluzione per acquistare soggiorni di almeno tre notti nelle strutture ricettive italiane, dal 1 luglio al 31 dicembre 2020. Il pagamento deve essere eseguito direttamente alla struttura e deve essere documentato tramite la fattura elettronica o attraverso un altro documento commerciale in cui sia indicato il codice fiscale del beneficiario.

#### Come funziona il processo di richiesta?
L’app IO è l’unico canale attraverso cui richiedere il bonus. Puoi richiedere il bonus se hai un ISEE valido e inferiore alla soglia di 40.000€.

Questi sono i passaggi che ti chiederemo di effettuare:
- fai click sul bottone qui sotto; 
- leggi e accetta i termini di servizio e la privacy;
- verificheremo con INPS il tuo ISEE;
- se hai un ISEE valido e sotto la soglia fissata, ti mostreremo a quanto ammonta il tuo bonus e chi sono i componenti del tuo nucleo familiare che potranno beneficiarne;
- conferma la richiesta con il tuo PIN dispositivo o utilizzando il biometrico;
- invieremo la tua richiesta ad Agenzia delle Entrate che la validerà;
- il tuo bonus sarà poi visibile nella sezione Pagamenti.

Se durante il processo, i dati relativi all’ISEE e al tuo nucleo familiare non dovessero essere corretti, ti preghiamo di verificare direttamente con il servizio clienti di INPS.`;

export const availableBonuses: BonusesAvailable = [
  {
    id_type: ID_BONUS_VACANZE_TYPE,
    it: {
      name: "Bonus Vacanze",
      subtitle:
        "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
      title: "Richiesta Bonus Vacanze",
      content: contentBonusVacanze,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    en: {
      name: "Bonus Vacanze EN",
      subtitle:
        "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19 EN",
      title: "Richiesta Bonus Vacanze",
      content: contentBonusVacanze,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    service_id: "01EB8AXKNV6NMSP2R25KSGF743",
    is_active: true,
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z"),
    cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_BonusVacanze.png",
    sponsorship_description: "Agenzia delle Entrate",
    sponsorship_cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_AgenziaEntrate.png"
  }
];
