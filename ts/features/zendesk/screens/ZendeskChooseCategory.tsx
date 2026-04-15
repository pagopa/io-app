import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import I18n from "i18next";
import { ZendeskCategory } from "../../../../definitions/content/ZendeskCategory";
import { isReady } from "../../../common/model/RemoteValue";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
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
  ZendeskAssistanceType,
  zendeskSelectedCategory,
  zendeskSupportFailure
} from "../store/actions";
import { zendeskConfigSelector } from "../store/reducers";

export type ZendeskChooseCategoryNavigationParams = {
  assistanceType: ZendeskAssistanceType;
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
  const { assistanceType } = props.route.params;
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

  const renderItem = ({
    item: category
  }: ListRenderItemInfo<ZendeskCategory>) => (
    <ListItemNav
      testID={category.value}
      value={category.description[locale]}
      onPress={() => {
        selectedCategory(category);
        // Set category as custom field
        addTicketCustomField(categoriesId, category.value);
        if (hasSubCategories(category)) {
          props.navigation.navigate(ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY, {
            assistanceType
          });
        } else {
          props.navigation.navigate(ZENDESK_ROUTES.ASK_PERMISSIONS, {
            assistanceType
          });
        }
      }}
    />
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("support.chooseCategory.title.category"),
        section: I18n.t("support.chooseCategory.header")
      }}
      description={I18n.t("support.chooseCategory.subTitle.category")}
      ignoreSafeAreaMargin={Platform.OS === "ios" ? true : false}
      testID={"ZendeskChooseCategory"}
    >
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={categories}
        keyExtractor={c => c.value}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default ZendeskChooseCategory;
