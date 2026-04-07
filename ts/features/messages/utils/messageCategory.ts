import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../definitions/backend/MessageCategoryBase";
import { MessageCategoryPayment } from "../../../../definitions/backend/MessageCategoryPayment";
import { MessageCategoryPN } from "../../../../definitions/backend/MessageCategoryPN";

export const foldMessageCategoryK =
  <A>(
    onGeneral: (baseCategoryEnum: TagEnum) => A,
    onPayment: (category: MessageCategoryPayment) => A,
    onSend: (category: MessageCategoryPN) => A
  ) =>
  (category: MessageCategory) => {
    switch (category.tag) {
      case "EU_COVID_CERT":
        return onGeneral(TagEnum.EU_COVID_CERT);
      case "LEGAL_MESSAGE":
        return onGeneral(TagEnum.LEGAL_MESSAGE);
      case "PAYMENT":
        return onPayment(category);
      case "PN":
        return onSend(category);
    }
    return onGeneral(TagEnum.GENERIC);
  };
