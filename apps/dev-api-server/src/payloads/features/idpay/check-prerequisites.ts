import { fakerIT as faker } from "@faker-js/faker";
import {
  CodeEnum as AutomatedCriteriaCodeEnum,
  AutomatedCriteriaDTO,
  OperatorEnum
} from "@io-app/api-types/generated/definitions/idpay/AutomatedCriteriaDTO";
import {
  CodeEnum as OnboardingErrorCodeEnum,
  OnboardingErrorDTO
} from "@io-app/api-types/generated/definitions/idpay/OnboardingErrorDTO";
import { OnboardingInitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingInitiativeDTO";
import { RowDataDTO } from "@io-app/api-types/generated/definitions/idpay/RowDataDTO";
import {
  SelfCriteriaBoolDTO,
  _typeEnum as SelfDeclarationBoolType
} from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaBoolDTO";
import {
  SelfCriteriaMultiDTO,
  _typeEnum as SelfDeclarationMultiType
} from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaMultiDTO";
import {
  CodeEnum as SelfCriteriaMultiCodeEnum,
  _typeEnum as SelfCriteriaMultiTypeDTO
} from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaMultiTypeDTO";
import { _typeEnum as SelfDeclaratioTextType } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaTextDTO";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";

import { getRandomEnumValue } from "../../utils/random";
import { IDPayInitiativeID } from "./types";

const automatedCriteria: ReadonlyArray<AutomatedCriteriaDTO> = [
  {
    code: AutomatedCriteriaCodeEnum.BIRTHDAY,
    authority: "INPS",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.date
      .between({ from: "1990-01-01", to: "1999-12-31" })
      .getFullYear()
      .toString(),
    value2: faker.date
      .between({ from: "1990-01-01", to: "2023-12-31" })
      .getFullYear()
      .toString()
  },
  {
    code: AutomatedCriteriaCodeEnum.ISEE,
    authority: "AGID",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.finance.amount({ min: 10000, max: 100000 }),
    value2: faker.finance.amount({ min: 10000, max: 100000 })
  },
  {
    code: AutomatedCriteriaCodeEnum.RESIDENCE,
    authority: "AGID",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.location.country()
  }
];

const familyUnityOnlyAutomatedCriteria: ReadonlyArray<AutomatedCriteriaDTO> = [
  {
    code: AutomatedCriteriaCodeEnum.FAMILY_UNIT,
    authority: "Ministero dell'interno",
    operator: OperatorEnum.EQ,
    value: "Ministero dell'Interno"
  }
];

const criterionArray: ReadonlyArray<RowDataDTO> = [
  {
    description: "Criterion 1",
    subDescription: "Subtitle criterion 1",
    value: "Value criterion 1"
  },
  {
    description: "Criterion 2",
    subDescription: "Subtitle criterion 2",
    value: "Value criterion 2"
  },
  {
    description: "Criterion 3",
    subDescription: "Subtitle criterion 3",
    value: "Value criterion 3"
  }
];
const selfDeclarationMulti: ReadonlyArray<SelfCriteriaMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla:",
    value: criterionArray
  },
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla, seconda pagina:",
    value: criterionArray
  }
];

const guidoniaSelfDeclarationMulti: ReadonlyArray<SelfCriteriaMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description: "Costituire una famiglia monogenitoriale:",
    value: [
      {
        description: "Sì"
      },
      {
        description: "No"
      }
    ]
  }
];

const selfDeclarationBool: ReadonlyArray<SelfCriteriaBoolDTO> =
  criterionArray.map(criterion => ({
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: criterion.description,
    subDescription: criterion.subDescription,
    value: false
  }));

const checkPrerequisites: {
  [id: number]: OnboardingInitiativeDTO;
} = {
  [IDPayInitiativeID.OK]: {
    beneficiaryRule: {
      automatedCriteria,
      selfDeclarationCriteria: [...selfDeclarationMulti, ...selfDeclarationBool]
    }
  },
  [IDPayInitiativeID.OK_INVITED]: {
    beneficiaryRule: {
      automatedCriteria,
      selfDeclarationCriteria: [...selfDeclarationMulti, ...selfDeclarationBool]
    }
  },
  [IDPayInitiativeID.OK_NO_PREREQUISITES]: {
    beneficiaryRule: {
      automatedCriteria: [],
      selfDeclarationCriteria: []
    }
  },
  [IDPayInitiativeID.OK_GUIDONIA]: {
    beneficiaryRule: {
      automatedCriteria,
      selfDeclarationCriteria: [
        ...guidoniaSelfDeclarationMulti,
        {
          _type: SelfDeclaratioTextType.text,
          code: ulid(),
          description:
            "Avere un ISEE valido al 31\\12\\2024 con un valore pari a:",
          value: "valore ISEE"
        },
        {
          _type: SelfDeclaratioTextType.text,
          code: ulid(),
          description:
            "Aver già presentato una Dichiarazione Sostitutive Unica (DSU) con numero di protocollo:",
          value: "Numero di protocollo DSU"
        },
        {
          _type: SelfDeclaratioTextType.text,
          code: ulid(),
          description: "Voler ricevere il rimborso al seguente IBAN:",
          value: "IBAN"
        }
      ]
    }
  },
  [IDPayInitiativeID.OK_PDND_ONLY]: {
    beneficiaryRule: {
      automatedCriteria,
      selfDeclarationCriteria: []
    }
  },
  [IDPayInitiativeID.OK_SELF_ONLY]: {
    beneficiaryRule: {
      automatedCriteria: [],
      selfDeclarationCriteria: [...selfDeclarationMulti, ...selfDeclarationBool]
    }
  },
  [IDPayInitiativeID.OK_BONUS_ELETTRODOMESTICI]: {
    beneficiaryRule: {
      automatedCriteria: familyUnityOnlyAutomatedCriteria,
      selfDeclarationCriteria: [
        {
          _type: SelfCriteriaMultiTypeDTO.multi_consent,
          code: SelfCriteriaMultiCodeEnum.isee,
          description: "Hai un ISEE 2025 in corso di validità?",
          subDescription: "Quando un ISEE è valido?",
          value: [
            {
              description: "Sì, inferiore a 25.000€",
              subDescription:
                "Hai diritto fino a 200€. Verificheremo questa informazione con INPS",
              value: "0"
            },
            {
              description: "Sì, uguale o superiore a 25.000€",
              subDescription: "Hai diritto fino a 100€",
              value: "1"
            },
            {
              description: "Non ho un ISEE o preferisco non rispondere",
              subDescription: "Hai diritto fino a 100€",
              value: "2"
            }
          ]
        },
        {
          _type: SelfDeclarationBoolType.boolean,
          code: ulid(),
          subDescription: "Ai sensi del  D.P.R. 28 dicembre 2000, n. 445",
          description:
            "Userò il bonus per l'acquisto di un elettrodomestico di classe energetica superiore destinato a sostituire un altro della stessa tipologia",
          value: false
        }
      ]
    }
  }
};

const prerequisitesErrors: {
  [id: number]: OnboardingErrorDTO;
} = {
  [IDPayInitiativeID.KO_GENERIC]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_GENERIC_ERROR,
    message: ""
  },
  [IDPayInitiativeID.KO_NOT_STARTED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_NOT_STARTED,
    message: ""
  },
  [IDPayInitiativeID.KO_ENDED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_ENDED,
    message: ""
  },
  [IDPayInitiativeID.KO_BUDGET_EXHAUSTED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_BUDGET_EXHAUSTED,
    message: ""
  },
  [IDPayInitiativeID.KO_STATUS_ON_EVALUATION]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_ON_EVALUATION,
    message: ""
  },
  [IDPayInitiativeID.KO_FAMILY_UNIT_ALREADY_JOINED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_FAMILY_UNIT_ALREADY_JOINED,
    message: ""
  },
  [IDPayInitiativeID.KO_ONBOARDING_WAITING_LIST]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_WAITING_LIST,
    message: ""
  },
  [IDPayInitiativeID.KO_TOO_MANY_REQUESTS]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_TOO_MANY_REQUESTS,
    message: ""
  }
};

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingInitiativeDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
