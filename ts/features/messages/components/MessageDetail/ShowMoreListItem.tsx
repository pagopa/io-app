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
  sections: ShowMoreSection;
};

export type ShowMoreSection = ReadonlyArray<{
  items: ShowMoreItems;
  title: string;
}>;

export type ShowMoreItems = ReadonlyArray<{
  accessibilityLabel: string;
  icon?: IOIcons;
  label: string;
  value: string;
}>;

export const ShowMoreListItem = ({ sections }: ShowMoreListItemProps) => {
  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={`SMLI_F${sectionIndex}`}>
              <ListItemHeader
                key={`SMLI_S${sectionIndex}`}
                label={section.title}
              />
              {section.items.map((item, itemIndex, items) => (
                <React.Fragment key={`SMLI_F${sectionIndex}_F${itemIndex}`}>
                  <ListItemInfoCopy
                    key={`SMLI_F${sectionIndex}_I${itemIndex}`}
                    accessibilityLabel={item.accessibilityLabel}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    onPress={() => clipboardSetStringWithFeedback(item.value)}
                  />
                  {itemIndex < items.length - 1 && (
                    <Divider key={`SMLI_F${sectionIndex}_D${itemIndex}`} />
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
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
