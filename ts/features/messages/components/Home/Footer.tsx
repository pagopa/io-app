import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { shouldShowFooterListComponentSelector } from "../../store/reducers/allPaginated";
import { MessageListCategory } from "../../types/messageListCategory";
import { ListItemMessageSkeleton } from "./DS/ListItemMessageSkeleton";

type FooterProps = {
  category: MessageListCategory;
};

export const Footer = ({ category }: FooterProps) => {
  const shouldShowFooter = useIOSelector(state =>
    shouldShowFooterListComponentSelector(state, category)
  );
  if (!shouldShowFooter) {
    return null;
  }
  return (
    <ListItemMessageSkeleton accessibilityLabel={I18n.t("messages.loading")} />
  );
};
