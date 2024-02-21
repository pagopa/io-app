import { BonusVisibilityEnum } from "../../../../definitions/content/BonusVisibility";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import { ID_CGN_TYPE } from "../common/utils";

export const contentBonusVacanzeIT = `#### Chi può richiederlo?

Il bonus è destinato a tutte le famiglie con un reddito familiare ISEE non superiore a 40.000€.

Il richiedente deve aver compiuto i 18 anni di età.

#### Quanto vale?
Il valore del bonus cambia in base al numero di componenti del nuceo familiare:
- 150€ per un solo componente; 
- 300€ per due componenti; 
- 500€ per più di due componenti.

L’incentivo consiste in uno sconto pari all’80% del valore del bonus, che viene applicato dalla struttura turistica al momento del pagamento della vacanza. Il restante 20% sarà fruito in forma di detrazione fiscale nella dichiarazione dei redditi.

#### Chi, dove e quando può spenderlo?
Ciascun membro del nucleo familiare può usufruire del bonus. 

Il bonus vacanze è spendibile in un’unica soluzione nelle strutture ricettive italiane,  dal 1 luglio al 31 dicembre 2020. 

Il pagamento deve essere eseguito direttamente alla struttura e deve essere documentato tramite fattura, documento commerciale, o scontrino/ricevuta fiscale in cui sia indicato il codice fiscale del beneficiario.

#### Come funziona il processo di richiesta?
L’app IO è l’unico canale attraverso cui richiedere il bonus. Puoi richiedere il bonus se hai un ISEE valido e non superiore a 40.000€.

Questi sono i passaggi che ti chiederemo di effettuare:
- inizia la richiesta, cliccando sul bottone qui sotto; 
- leggi i termini di servizio e la privacy; 
- l'app IO chiederà a INPS di verificare l'ISEE del tuo nucleo familiare; 
- se hai un ISEE valido e sotto la soglia fissata, ti mostreremo a quanto ammonta il tuo bonus e chi sono i componenti del tuo nucleo familiare che potranno beneficiarne; 
- se confermi la richiesta, IO genera il tuo Bonus Vacanze; 
- una volta attivo, il tuo bonus sarà visibile nella sezione Portafoglio.
`;

const contentBonusVacanzeEN = `#### Who can request it?

The bonus is intended for all families with an ISEE family income of no more than € 40,000.

The applicant must be over 18 years of age.

#### How much is it worth?
The bonus value changes according to the number of members of the family:
- € 150 for one person;
- € 300 for two people;
- € 500 for more than two people.

The incentive consists of a discount equal to 80% of the bonus value, which is applied by the tourist facility when paying for the holiday. The remaining 20% will be used in the form of a tax deduction in the individual income tax return.
 
#### Who, where and when can spend it?
Each member of the household can use the bonus.

It has to be spent in a single payment in Italian accommodation facilities, from 1 July to 31 December 2020.

Payment must be made directly to the structure and must be documented through an invoice, commercial document, or receipt showing the beneficiary's tax code.

#### How does the application process work?
IO app is the only channel through which it is possible to request the bonus. You can claim the bonus if you or somebody in your household have a valid ISEE not exceeding € 40,000.

This is the process in app:
- start the request by clicking on the button below;
- read the terms of service and privacy;
- IO will ask INPS to verify your family's ISEE;
- if you have a valid ISEE below the set threshold, we will show you how much your bonus is worth and the members of your family who can use it;
- if you confirm the request, IO generates your Bonus Vacanze;
- once activated, your bonus will be visible in the Payments section of the app.
`;

export const availableBonuses: BonusesAvailable = [
  {
    id_type: ID_CGN_TYPE,
    it: {
      name: "Carta Giovani Nazionale",
      description:
        "Fino a 500€ a nucleo familiare per andare in vacanza in Italia",
      subtitle:
        "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
      title: "Richiesta Bonus Vacanze",
      content: contentBonusVacanzeIT,
      tos_url: "https://io.italia.it/app-content/bonus_vacanze_tos.html"
    },
    en: {
      name: "Carta Giovani Nazionale",
      description: "Up to € 500 per family to go on holiday in Italy",
      subtitle:
        "The incentive established to support tourism after the lockdown due to the Coronavirus emergency.",
      title: "Bonus Vacanze Request",
      content: contentBonusVacanzeEN,
      tos_url: "https://io.italia.it/app-content/bonus_vacanze_tos.html"
    },
    service_id: "01EB8AXKNV6NMSP2R25KSGF743",
    is_active: false,
    hidden: true,
    visibility: BonusVisibilityEnum.experimental,
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z"),
    cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_BonusVacanze.png",
    sponsorship_description: "Agenzia delle Entrate",
    sponsorship_cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_AgenziaEntrate.png"
  }
];
