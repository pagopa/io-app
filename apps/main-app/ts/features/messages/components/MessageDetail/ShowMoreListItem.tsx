import {
  Divider,
  IOIcons,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment } from "react";

import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

export type ShowMoreItem = {
  accessibilityLabel: string;
  icon?: IOIcons;
  label: string;
  value: string;
  valueToCopy?: string;
};

export type ShowMoreListItemProps = {
  sections: ReadonlyArray<ShowMoreSection>;
};

export type ShowMoreSection = {
  items: ReadonlyArray<ShowMoreItem>;
  title: string;
};

export const ShowMoreListItem = ({ sections }: ShowMoreListItemProps) => {
  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        {sections.map((section, sectionIndex) => (
          <Fragment key={`SMLI_F${sectionIndex}`}>
            <ListItemHeader
              key={`SMLI_S${sectionIndex}`}
              label={section.title}
            />
            {section.items.map((item, itemIndex, items) => (
              <Fragment key={`SMLI_F${sectionIndex}_F${itemIndex}`}>
                <ListItemInfoCopy
                  accessibilityLabel={item.accessibilityLabel}
                  icon={item.icon}
                  key={`SMLI_F${sectionIndex}_I${itemIndex}`}
                  label={item.label}
                  onPress={() =>
                    clipboardSetStringWithFeedback(
                      item.valueToCopy ?? item.value
                    )
                  }
                  value={item.value}
                />
                {itemIndex < items.length - 1 && (
                  <Divider key={`SMLI_F${sectionIndex}_D${itemIndex}`} />
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </>
    ),
    title: I18n.t("messageDetails.showMoreDataBottomSheet.title")
  });

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
