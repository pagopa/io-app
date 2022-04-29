import { CompatNavigationProp } from "@react-navigation/compat";
import { useNavigation } from "@react-navigation/native";
import { ListItem } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView
} from "react-native";
import { useDispatch } from "react-redux";
import { ZendeskSubCategory } from "../../../../definitions/content/ZendeskSubCategory";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import customVariables from "../../../theme/variables";
import { getFullLocale } from "../../../utils/locale";
import {
  addTicketCustomField,
  hasSubCategories
} from "../../../utils/supportAssistance";
import { ZendeskParamsList } from "../navigation/params";
import {
  zendeskSelectedSubcategory,
  zendeskSupportFailure
} from "../store/actions";
import { zendeskSelectedCategorySelector } from "../store/reducers";

export type ZendeskChooseSubCategoryNavigationParams = {
  assistanceForPayment: boolean;
};

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<ZendeskParamsList, "ZENDESK_CHOOSE_SUB_CATEGORY">
  >;
};

/**
 * this screen shows the sub-categories for which the user can ask support with the assistance
 * see {@link ZendeskChooseCategory} to check the previous category screen
 */
const ZendeskChooseSubCategory = (props: Props) => {
  const selectedCategory = useIOSelector(zendeskSelectedCategorySelector);
  const dispatch = useDispatch();
  const navigation = useNavigation<IOStackNavigationProp<ZendeskParamsList>>();
  const assistanceForPayment = props.navigation.getParam(
    "assistanceForPayment"
  );
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

  const renderItem = (listItem: ListRenderItemInfo<ZendeskSubCategory>) => {
    const subCategory = listItem.item;
    return (
      <ListItem
        onPress={() => {
          selectedSubcategory(subCategory);
          // Set sub-category as custom field
          addTicketCustomField(subCategoriesId, subCategory.value);
          navigation.navigate("ZENDESK_ASK_PERMISSIONS", {
            assistanceForPayment
          });
        }}
        first={listItem.index === 0}
        style={{ paddingRight: 0 }}
        testID={subCategory.value}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <H4
            weight={"Regular"}
            color={"bluegreyDark"}
            style={{
              flex: 1,
              flexGrow: 1
            }}
          >
            {subCategory.description[locale]}
          </H4>
          <View>
            <IconFont
              name={"io-right"}
              size={24}
              color={customVariables.contentPrimaryBackground}
            />
          </View>
        </View>
      </ListItem>
    );
  };

  // The void customRightIcon is needed to have a centered header title
  return (
    <BaseScreenComponent
      showChat={false}
      goBack={true}
      customRightIcon={{
        iconName: "",
        onPress: () => true
      }}
      headerTitle={selectedCategory.description[locale]}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskChooseCategory"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("support.chooseCategory.title.subCategory")}</H1>
          <View spacer />
          <FlatList
            data={subCategories}
            keyExtractor={c => c.value}
            renderItem={renderItem}
          />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskChooseSubCategory;
