import { UIMessageDetails } from "../types";
import { toUIMessageDetails } from "../store/reducers/transformers";
import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/communication/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "../../../../definitions/backend/identity/FiscalCode";
import { PaymentDataWithRequiredPayee } from "../../../../definitions/backend/communication/PaymentDataWithRequiredPayee";
import { service_1 } from "./messages";

export const messageId_1 = "FAT00001";

/**
 * Generic message with due date.
 */
export const message_1: CreatedMessageWithContentAndAttachments = {
  id: messageId_1,
  fiscal_code: service_1.organization.fiscal_code as unknown as FiscalCode,
  created_at: new Date(),
  content: {
    markdown:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue." as any,
    subject: "Lorem ipsum..." as any
  },
  sender_service_id: service_1.id
};

export const messageWithValidPayment: CreatedMessageWithContentAndAttachments =
  {
    ...message_1,
    created_at: new Date("2024-01-01T14:16:41Z"),
    content: {
      ...message_1.content,
      payment_data: {
        notice_number: "075970423479738892",
        amount: 698,
        invalid_after_due_date: true,
        payee: { fiscal_code: "00000000003" }
      } as PaymentDataWithRequiredPayee
    }
  };

export const messageWithExpiredPayment: CreatedMessageWithContentAndAttachments =
  {
    ...message_1,
    created_at: new Date("2024-01-01T14:16:41Z"),
    content: {
      ...message_1.content,
      due_date: new Date("2024-02-03T14:16:41Z"),
      payment_data: {
        notice_number: "075970423479738892",
        amount: 698,
        invalid_after_due_date: true,
        payee: { fiscal_code: "00000000003" }
      } as PaymentDataWithRequiredPayee
    }
  };

export const paymentValidInvalidAfterDueDate: CreatedMessageWithContentAndAttachments =
  {
    created_at: "2021-11-23T13:29:54.771Z",
    fiscal_code: "TAMMRA80A41H501I",
    id: "00000000000000000000000018",
    sender_service_id: service_1,
    time_to_live: 3600,
    content: {
      subject: "💰🕙✅ payment - valid - invalid after due date - 1",
      markdown:
        "\n# H1 \n\n## H2 \n\n### H3 \n\n#### H4\n\n-----\n\n### an image\n![A cat](data:image/jpg;base64,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)\n\n-----\n\n### item list\n\n- item1\n- item2 \n- item3 \n- item4 \n- item5 \n- item6 \n\n-----\n\n### enumerated list\n\n1. item1\n1. item2 \n1. item3 \n1. item4 \n1. item5 \n1. item6 \n\n-----\n\n### formatted text\nÈ universalmente **riconosciuto** che un _lettore_ che **osserva** il layout di una pagina viene distratto dal contenuto testuale se questo è leggibile. Lo scopo dell’utilizzo del Lorem Ipsum è che offre una normale distribuzione delle lettere (al contrario di quanto avviene se si utilizzano brevi frasi ripetute, ad esempio “testo qui”), apparendo come un normale blocco di testo leggibile. Molti software di impaginazione e di web design utilizzano Lorem Ipsum come testo modello. Molte versioni del testo sono state prodotte negli anni, a volte casualmente, a volte di proposito (ad esempio inserendo passaggi ironici).\n\n| copia e incolla il seguente link: `https://verylongurl.com/verylong_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_`\n\n-----\n\n### external links\n\na link must **always** include the protocol (`http://` or `https://`)\n\n[Google](https://www.google.it)\n\n[Invalid link -1](www.google.it)\n\n[Invalid link -2](google.it)\n\n-----\n\n### Internal navigation\n\n[BONUS_AVAILABLE_LIST](ioit://BONUS_AVAILABLE_LIST)\n\n[BONUS_CTA_ELIGILITY_START](ioit://BONUS_CTA_ELIGILITY_START)\n\n[MESSAGES_HOME](ioit://MESSAGES_HOME)\n\n[PROFILE_PREFERENCES_HOME](ioit://PROFILE_PREFERENCES_HOME)\n\n[SERVICES_HOME](ioit://SERVICES_HOME)\n\n[PROFILE_MAIN](ioit://PROFILE_MAIN)\n\n[PROFILE_PRIVACY](ioit://PROFILE_PRIVACY)\n\n[PROFILE_PRIVACY_MAIN](ioit://PROFILE_PRIVACY_MAIN)\n\n[WALLET_HOME](ioit://WALLET_HOME)\n\n[WALLET_LIST](ioit://WALLET_LIST)\n\n[PAYMENTS_HISTORY_SCREEN](ioit://PAYMENTS_HISTORY_SCREEN)\n\n[WALLET_HOME con parametri](ioit://WALLET_HOME?param1=a&param2=b&param3=c&param4=100)\n\n[SERVICE WEBVIEW](ioit://SERVICE_WEBVIEW?url=https://www.google.com)\n\n[LINK CORROTTO](ioit://WRONG&$)\n\n### Handled link\n[http - google](iohandledlink://http://www.google.com)\n\n[https - google](iohandledlink://https://www.google.com)\n\n[clipboard](iohandledlink://copy:textcopy)\n\n[sms](iohandledlink://sms:+123456789)\n\n[tel](iohandledlink://tel:+123456789)\n\n[mailto](iohandledlink://mailto:name.surname@email.com)\n\n",
      payment_data: {
        notice_number: "075970423479738892",
        amount: 698,
        invalid_after_due_date: true,
        payee: { fiscal_code: "00000000003" }
      },
      due_date: "2021-12-01T13:29:35.770Z"
    }
  } as any;

export const successLoadMessageDetails: UIMessageDetails = toUIMessageDetails(
  paymentValidInvalidAfterDueDate
);

export const apiPayload = { ...paymentValidInvalidAfterDueDate };
