import React from "react";
import {
  Divider,
  IOIcons,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

type ShowMoreListItemProps = {
  sections: ReadonlyArray<{
    title: string;
    items: ReadonlyArray<{
      accessibilityLabel: string;
      icon?: IOIcons;
      label: string;
      value: string;
    }>;
  }>;
};

export const ShowMoreListItem = ({ sections }: ShowMoreListItemProps) => {
  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <>
          {sections.map((section, sectionIndex) => (
            <>
              <ListItemHeader
                key={`SMLI_SEC${sectionIndex}`}
                label={section.title}
              />
              {section.items.map((item, itemIndex, items) => (
                <>
                  <ListItemInfoCopy
                    accessibilityLabel={item.accessibilityLabel}
                    icon={item.icon}
                    key={`SMLI_SEC${sectionIndex}_ITE${itemIndex}`}
                    label={item.label}
                    onPress={() => clipboardSetStringWithFeedback(item.value)}
                    value={item.value}
                  />
                  {itemIndex < items.length - 1 && (
                    <Divider key={`SMLI_SEC${sectionIndex}_DIV${itemIndex}`} />
                  )}
                </>
              ))}
            </>
          ))}
        </>
      ),
      title: I18n.t("messageDetails.showMoreDataBottomSheet.title")
    },
    100
  );

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("messageDetails.footer.showMoreData")}
        icon="terms"
        label={I18n.t("messageDetails.footer.showMoreData")}
        onPress={present}
        testID="show-more-data-action"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
