import { Fragment } from "react";
import {
  Divider,
  IOIcons,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

export type ShowMoreListItemProps = {
  sections: ReadonlyArray<ShowMoreSection>;
};

export type ShowMoreSection = {
  items: ReadonlyArray<ShowMoreItems>;
  title: string;
};

export type ShowMoreItems = {
  accessibilityLabel: string;
  icon?: IOIcons;
  label: string;
  value: string;
  valueToCopy?: string;
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
                  key={`SMLI_F${sectionIndex}_I${itemIndex}`}
                  accessibilityLabel={item.accessibilityLabel}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  onPress={() =>
                    clipboardSetStringWithFeedback(
                      item.valueToCopy ?? item.value
                    )
                  }
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
