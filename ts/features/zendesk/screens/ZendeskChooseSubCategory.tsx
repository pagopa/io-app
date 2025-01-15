import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { ZendeskSubCategory } from "../../../../definitions/content/ZendeskSubCategory";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getFullLocale } from "../../../utils/locale";
import {
  addTicketCustomField,
  hasSubCategories
} from "../../../utils/supportAssistance";
import { ZendeskParamsList } from "../navigation/params";
import {
  ZendeskAssistanceType,
  zendeskSelectedSubcategory,
  zendeskSupportFailure
} from "../store/actions";
import { zendeskSelectedCategorySelector } from "../store/reducers";

export type ZendeskChooseSubCategoryNavigationParams = {
  assistanceType: ZendeskAssistanceType;
};

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_CHOOSE_SUB_CATEGORY"
>;

/**
 * this screen shows the sub-categories for which the user can ask support with the assistance
 * see {@link ZendeskChooseCategory} to check the previous category screen
 */
const ZendeskChooseSubCategory = (props: Props) => {
  const selectedCategory = useIOSelector(zendeskSelectedCategorySelector);
  const dispatch = useIODispatch();
  const { assistanceType } = props.route.params;
  const selectedSubcategory = (subcategory: ZendeskSubCategory) =>
    dispatch(zendeskSelectedSubcategory(subcategory));
  const zendeskWorkUnitFailure = (reason: string) =>
    dispatch(zendeskSupportFailure(reason));

  // It should never happens since it is selected in the previous screen
  if (selectedCategory === undefined) {
    zendeskWorkUnitFailure("The category has not been selected");
    return null;
  }

  // It should never happens since it is checked in the previous screen
  if (!hasSubCategories(selectedCategory)) {
    zendeskWorkUnitFailure("The selected category has no sub-categories");
    return null;
  }

  // The check for subCategories and subCategoriesId is already done just above
  const subCategories =
    selectedCategory.zendeskSubCategories?.subCategories ?? [];
  const subCategoriesId: string =
    selectedCategory.zendeskSubCategories?.id ?? "";

  const locale = getFullLocale();

  const renderItem = ({
    item: subCategory
  }: ListRenderItemInfo<ZendeskSubCategory>) => (
    <ListItemNav
      testID={subCategory.value}
      value={subCategory.description[locale]}
      onPress={() => {
        selectedSubcategory(subCategory);
        // Set sub-category as custom field
        addTicketCustomField(subCategoriesId, subCategory.value);
        props.navigation.navigate("ZENDESK_ASK_PERMISSIONS", {
          assistanceType
        });
      }}
    />
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("support.chooseCategory.title.subCategory"),
        section: selectedCategory.description[locale]
      }}
      ignoreSafeAreaMargin={true}
      testID={"ZendeskChooseCategory"}
    >
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={subCategories}
        keyExtractor={c => c.value}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default ZendeskChooseSubCategory;
