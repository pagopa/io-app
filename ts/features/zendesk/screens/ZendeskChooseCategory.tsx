import { Divider, Icon, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import { ZendeskCategory } from "../../../../definitions/content/ZendeskCategory";
import { isReady } from "../../../common/model/RemoteValue";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { toArray } from "../../../store/helpers/indexer";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getFullLocale } from "../../../utils/locale";
import {
  addTicketCustomField,
  hasSubCategories
} from "../../../utils/supportAssistance";
import { ZendeskParamsList } from "../navigation/params";
import ZENDESK_ROUTES from "../navigation/routes";
import {
  zendeskSelectedCategory,
  zendeskSupportFailure
} from "../store/actions";
import { zendeskConfigSelector } from "../store/reducers";

export type ZendeskChooseCategoryNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
};

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_CHOOSE_CATEGORY"
>;

/**
 * this screen shows the categories for which the user can ask support with the assistance
 */
const ZendeskChooseCategory = (props: Props) => {
  const dispatch = useIODispatch();
  const { assistanceForPayment, assistanceForCard, assistanceForFci } =
    props.route.params;
  const zendeskConfig = useIOSelector(zendeskConfigSelector);
  const selectedCategory = (category: ZendeskCategory) =>
    dispatch(zendeskSelectedCategory(category));
  const zendeskWorkUnitFailure = (reason: string) =>
    dispatch(zendeskSupportFailure(reason));

  // It should never happens since if config is undefined or in error the user can open directly a ticket and if it is in loading the user
  // should wait in the ZendeskSupportHelpCenter screen
  if (!isReady(zendeskConfig)) {
    zendeskWorkUnitFailure("Config is not ready");
    return null;
  }

  const categories: ReadonlyArray<ZendeskCategory> = toArray(
    zendeskConfig.value.zendeskCategories?.categories ?? {}
  );
  const categoriesId: string | undefined =
    zendeskConfig.value.zendeskCategories?.id;

  // It should never happens since if the zendeskCategories are not in the config or if the array is void the user can open directly a ticket
  if (categories.length === 0 || categoriesId === undefined) {
    zendeskWorkUnitFailure("The config has no categories");
    return null;
  }

  const locale = getFullLocale();

  const renderItem = (listItem: ListRenderItemInfo<ZendeskCategory>) => {
    const category = listItem.item;
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          selectedCategory(category);
          // Set category as custom field
          addTicketCustomField(categoriesId, category.value);
          if (hasSubCategories(category)) {
            props.navigation.navigate(ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY, {
              assistanceForPayment,
              assistanceForCard,
              assistanceForFci
            });
          } else {
            props.navigation.navigate(ZENDESK_ROUTES.ASK_PERMISSIONS, {
              assistanceForPayment,
              assistanceForCard,
              assistanceForFci
            });
          }
        }}
        testID={category.value}
        // Hacky solution waiting for the replacement with `ListItem` from the DS
        style={{
          paddingVertical: 16
        }}
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
            <Icon name="chevronRightListItem" size={24} color="blue" />
          </View>
        </View>
      </Pressable>
    );
  };

  // The void customRightIcon is needed to have a centered header title
  return (
    <BaseScreenComponent
      showChat={false}
      goBack={true}
      headerTitle={I18n.t("support.chooseCategory.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskChooseCategory"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("support.chooseCategory.title.category")}</H1>
          <VSpacer size={16} />
          <H4 weight={"Regular"}>
            {I18n.t("support.chooseCategory.subTitle.category")}
          </H4>
          <VSpacer size={16} />
          <FlatList
            data={categories}
            keyExtractor={c => c.value}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <Divider />}
          />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskChooseCategory;
