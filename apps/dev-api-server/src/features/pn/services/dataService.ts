import { fakerIT as faker } from "@faker-js/faker";
import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { HasPreconditionEnum } from "@io-app/api-types/generated/definitions/communication/HasPrecondition";
import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { SpecialServiceCategoryEnum } from "@io-app/api-types/generated/definitions/services/SpecialServiceCategory";
import { StandardServiceCategoryEnum } from "@io-app/api-types/generated/definitions/services/StandardServiceCategory";

import { getNewMessage } from "../../../populate-persistence";
import { IoDevServerConfig } from "../../../types/config";
import { validatePayload } from "../../../utils/validator";
import { nextMessageIdAndCreationDate } from "../../messages/utils";
import {
  ioOrganizationFiscalCode,
  ioOrganizationName
} from "../../services/persistence/services/factory";

export const sendOptInServiceId = "01G74SW1PSM6XY2HM5EGZHZZET" as ServiceId;
const sendOptInServiceName = "SEND - Novità e aggiornamenti";
export const sendServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;
const sendServiceName = "SEND - Notifiche digitali";

const sendOptInMessageCTA = `---
it:
    cta_1: 
        text: "Attiva per leggere la notifica"
        action: "ioit://services/service-detail?serviceId=${sendServiceId}&activate=true"
en:
    cta_1: 
        text: "Enable to read notification"
        action: "ioit://services/service-detail?serviceId=${sendServiceId}&activate=true"
---`;

export const createSENDService = (): ServiceDetails => {
  const sendService = {
    description:
      "SEND digitalizza e semplifica le comunicazioni a valore legale come multe o altre comunicazioni importanti. Ti permette infatti di visualizzare, pagare e gestire le notifiche direttamente online o in app.\n\n**Tramite IO potrai:**\n- **risparmiare** i costi delle raccomandate cartacee;\n- **non perdere nessuna** comunicazione ricevendo immediatamente un messagio per ogni notifica indirizzata a te;\n- leggere il contenuto della notifica e visualizzare gli allegati;\n- pagare direttamente in app eventuali costi.\n\nAprire un messaggio inviato dal servizio \"Notifiche digitali\" di SEND equivale a firmare la ricevuta di ritorna di una raccomandata tradizionale.\n\nSe non hai una PEC nei registri pubblici, non l'hai fornita su SEND o l'hai fornita ma risulta inattiva, satura o non valida e apri su IO un messaggio inviato da questo servizio entro 5 giorni (120 ore) dal suo invio, non riceverai la notifica tramite raccomandata.",
    id: sendServiceId,
    name: sendServiceName,
    organization: {
      fiscal_code: ioOrganizationFiscalCode,
      name: ioOrganizationName
    },
    metadata: {
      scope: ScopeTypeEnum.NATIONAL,
      web_url: "https://notifichedigitali.it/cittadini",
      tos_url: "https://cittadini.notifichedigitali.it/termini-di-servizio",
      privacy_url: "https://cittadini.notifichedigitali.it/informativa-privacy",
      support_url: "https://assistenza.notifichedigitali.it/hc/it",
      category: SpecialServiceCategoryEnum.SPECIAL,
      custom_special_flow: "pn"
    }
  };
  return validatePayload(ServiceDetails, sendService);
};

export const createSENDOptInService = (): ServiceDetails => {
  const sendOptInService = {
    description:
      "SEND digitalizza e semplifica le comunicazioni a valore legale. Ti permette infatti di leggere e pagare le notifiche direttamente online o in app.\n\nTramite IO, potrai ricevere messaggi relativi alle novità e agli aggiornamenti del servizio.",
    id: sendOptInServiceId,
    name: sendOptInServiceName,
    organization: {
      fiscal_code: ioOrganizationFiscalCode,
      name: ioOrganizationName
    },
    metadata: {
      scope: ScopeTypeEnum.NATIONAL,
      web_url: "https://notifichedigitali.it/cittadini",
      tos_url: "https://cittadini.notifichedigitali.it/termini-di-servizio",
      privacy_url: "https://cittadini.notifichedigitali.it/informativa-privacy",
      support_url:
        "https://assistenza.ioapp.it/hc/it/sections/30831007235089-Notiche-SEND",
      category: StandardServiceCategoryEnum.STANDARD
    }
  };
  return validatePayload(ServiceDetails, sendOptInService);
};

export const createSENDOptInMessage = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> => {
  if (!customConfig.send.sendOptInMessage) {
    return [];
  }
  return [
    getNewMessage(
      customConfig,
      `Hai una comunicazione a valore legale da SEND`,
      `${sendOptInMessageCTA}\nCiao,\n\nhai ricevuto una **notifica SEND**, cioè una comunicazione a valore legale emessa da un'amministrazione.\n\nPer leggere la notifica in app, **attiva il servizio SEND entro 5 giorni**: eviterai una raccomandata e i relativi costi.\n\nSe attivi il servizio dopo, dovrai consultare questa comunicazione tramite altri canali, ma riceverai in app le notifiche SEND future.\n\nPremendo “Attiva per leggere la notifica” accetti i **[Termini e condizioni d’uso](https://cittadini.notifichedigitali.it/termini-di-servizio)** e confermi di avere letto l’**[Informativa privacy](https://cittadini.notifichedigitali.it/informativa-privacy)**.`,
      undefined,
      sendOptInServiceId
    )
  ];
};

export const createSENDMessagesOnIO = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> => {
  const sendMessagesConfiguration = customConfig.send.sendMessages;
  const sendNotificationsConfiguration = customConfig.send.sendNotifications;
  return sendMessagesConfiguration.reduce<
    Array<CreatedMessageWithContentAndAttachments>
  >((sendMessagesOnIO, sendMessageConfiguration) => {
    const { iun, ioTitle } = sendMessageConfiguration;
    const sendNotificationConfiguration = sendNotificationsConfiguration.find(
      sendNotificationConfiguration => sendNotificationConfiguration.iun === iun
    );
    if (sendNotificationConfiguration == null) {
      // eslint-disable-next-line no-console
      console.warn(
        `An IO message for a SEND notification has been created but such Notification does not exist on SEND (iun: ${iun})`
      );
    }

    const { id, created_at } = nextMessageIdAndCreationDate();
    const hasAttachments =
      (sendNotificationConfiguration?.attachments?.length ?? 0) > 0;
    const sendMessageOnIO = {
      category: {
        id: iun,
        tag: "PN"
      },
      time_to_live: 3600, // this is the type's default TTL
      content: {
        subject:
          ioTitle ?? faker.word.words(faker.number.int({ min: 3, max: 5 })),
        markdown:
          "This markdown is not used but it has to be at least eighty characters long to pass",
        third_party_data: {
          id: iun,
          has_attachments: hasAttachments,
          has_remote_content: true,
          has_precondition: HasPreconditionEnum.ALWAYS
        }
      },
      created_at,
      fiscal_code: customConfig.profile.attrs.fiscal_code,
      has_attachments: hasAttachments,
      has_precondition: true,
      id,
      is_archived: false,
      is_read: false,
      organization_fiscal_code: ioOrganizationFiscalCode,
      organization_name: ioOrganizationName,
      message_title:
        sendNotificationConfiguration?.subject ?? "This message has no title",
      sender_service_id: sendServiceId,
      service_name: sendServiceName
    } as unknown as CreatedMessageWithContentAndAttachments;
    // we avoid using ValidatePayload here because the decoding is based on a `t.exact` type
    // which, on `decode` would strip certain properties, thus breaking logic.
    return [...sendMessagesOnIO, sendMessageOnIO];
  }, []);
};
