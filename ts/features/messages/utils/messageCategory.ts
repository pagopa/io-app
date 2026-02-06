import { MessageCategory } from "../../../../definitions/backend/communication/MessageCategory";
import { TagEnum } from "../../../../definitions/backend/communication/MessageCategoryBase";
import { MessageCategoryPN } from "../../../../definitions/backend/communication/MessageCategoryPN";
import { MessageCategoryPayment } from "../../../../definitions/backend/communication/MessageCategoryPayment";

export const foldMessageCategoryK =
  <A>(
    onGeneral: (baseCategoryEnum: TagEnum) => A,
    onPayment: (category: MessageCategoryPayment) => A,
    onSend: (category: MessageCategoryPN) => A
  ) =>
  (category: MessageCategory) => {
    switch (category.tag) {
      case "PAYMENT":
        return onPayment(category);
      case "PN":
        return onSend(category);
      case "LEGAL_MESSAGE":
        return onGeneral(TagEnum.LEGAL_MESSAGE);
      case "EU_COVID_CERT":
        return onGeneral(TagEnum.EU_COVID_CERT);
    }
    return onGeneral(TagEnum.GENERIC);
  };
