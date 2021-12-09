import React from "react";
import { FlatList, SafeAreaView, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import { ListItem } from "native-base";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { zendeskConfigSelector } from "../store/reducers";
import {
  isError,
  isLoading,
  isUndefined
} from "../../bonus/bpd/model/RemoteValue";
import { toArray } from "../../../store/helpers/indexer";
import { H4 } from "../../../components/core/typography/H4";
import customVariables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { navigateToZendeskChooseSubCategory } from "../store/actions/navigation";
import {
  zendeskSelectedCategory,
  zendeskSupportCompleted
} from "../store/actions";
import { ZendeskCategory } from "../../../../definitions/content/ZendeskCategory";
import { openSupportTicket } from "../../../utils/supportAssistance";
import { getFullLocale } from "../../../utils/locale";

const ZendeskChooseCategory = () => {
  const dispatch = useDispatch();
  const navigation = useNavigationContext();
  const zendeskConfig = useIOSelector(zendeskConfigSelector);
  const selectedCategory = (category: ZendeskCategory) =>
    dispatch(zendeskSelectedCategory(category));
  const zendeskWorkunitComplete = () => dispatch(zendeskSupportCompleted());

  // It should never happens since if config is undefined or in error the user can open directly a ticket and if is in loading the user
  // should wait in the ZendeskSupportHelpCenter screen
  if (
    isUndefined(zendeskConfig) ||
    isError(zendeskConfig) ||
    isLoading(zendeskConfig)
  ) {
    return <WorkunitGenericFailure />;
  }

  const indexedCategories = zendeskConfig.value.zendeskCategories?.categories;
  const categories = indexedCategories ? toArray(indexedCategories) : [];

  // It should never happens since if the zendeskCategories are not in the config or if the array is void the user can open directly a ticket
  if (indexedCategories === undefined || categories.length === 0) {
    return <WorkunitGenericFailure />;
  }

  const locale = getFullLocale();
  // The void customRightIcon is needed to have a centered header title
  return (
    <BaseScreenComponent
      showInstabugChat={false}
      goBack={true}
      customRightIcon={{
        iconName: "",
        onPress: () => true
      }}
      headerTitle={I18n.t("support.chooseCategory.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskChooseCategory"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("support.chooseCategory.title.category")}</H1>
          <View spacer />
          <H4 weight={"Regular"}>
            {I18n.t("support.chooseCategory.subTitle.category")}
          </H4>
          <View spacer />
          <FlatList
            data={categories}
            keyExtractor={c => c.value}
            renderItem={i => (
              <ListItem
                onPress={() => {
                  const category = i.item;
                  selectedCategory(category);
                  // TODO: set category as custom field
                  if (
                    category.zendeskSubCategories !== undefined &&
                    category.zendeskSubCategories.subCategories.length > 0
                  ) {
                    navigation.navigate(navigateToZendeskChooseSubCategory());
                  } else {
                    openSupportTicket();
                    zendeskWorkunitComplete();
                  }
                }}
                first={i.index === 0}
                style={{ paddingRight: 0 }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <H4 weight={"Regular"} color={"bluegreyDark"}>
                    {i.item.description[locale]}
                  </H4>
                  <IconFont
                    name={"io-right"}
                    size={24}
                    color={customVariables.contentPrimaryBackground}
                  />
                </View>
              </ListItem>
            )}
          />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskChooseCategory;
