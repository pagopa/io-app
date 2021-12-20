import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView
} from "react-native";
import { useDispatch } from "react-redux";
import { ListItem } from "native-base";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { zendeskConfigSelector } from "../store/reducers";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
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
import {
  addTicketCustomField,
  hasSubCategories,
  openSupportTicket
} from "../../../utils/supportAssistance";
import { getFullLocale } from "../../../utils/locale";

/**
 * this screen shows the categories for which the user can ask support with the assistance
 */
const ZendeskChooseCategory = () => {
  const dispatch = useDispatch();
  const navigation = useNavigationContext();
  const zendeskConfig = useIOSelector(zendeskConfigSelector);
  const selectedCategory = (category: ZendeskCategory) =>
    dispatch(zendeskSelectedCategory(category));
  const zendeskWorkunitComplete = () => dispatch(zendeskSupportCompleted());

  // It should never happens since if config is undefined or in error the user can open directly a ticket and if it is in loading the user
  // should wait in the ZendeskSupportHelpCenter screen
  if (!isReady(zendeskConfig)) {
    return <WorkunitGenericFailure />;
  }

  const categories: ReadonlyArray<ZendeskCategory> = toArray(
    zendeskConfig.value.zendeskCategories?.categories ?? {}
  );
  const categoriesId: string | undefined =
    zendeskConfig.value.zendeskCategories?.id;

  // It should never happens since if the zendeskCategories are not in the config or if the array is void the user can open directly a ticket
  if (categories.length === 0 || categoriesId === undefined) {
    return <WorkunitGenericFailure />;
  }

  const locale = getFullLocale();

  const renderItem = (listItem: ListRenderItemInfo<ZendeskCategory>) => {
    const category = listItem.item;
    return (
      <ListItem
        onPress={() => {
          selectedCategory(category);
          // Set category as custom field
          addTicketCustomField(categoriesId, category.value);
          if (hasSubCategories(category)) {
            navigation.navigate(navigateToZendeskChooseSubCategory());
          } else {
            openSupportTicket();
            zendeskWorkunitComplete();
          }
        }}
        first={listItem.index === 0}
        style={{ paddingRight: 0 }}
      >
        <View
          style={{
            flex: 1,
            flexGrow: 1,
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
            {category.description[locale]}
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
            renderItem={renderItem}
          />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskChooseCategory;
