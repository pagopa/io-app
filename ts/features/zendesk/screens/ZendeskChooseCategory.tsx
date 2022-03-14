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
import { ZendeskCategory } from "../../../../definitions/content/ZendeskCategory";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { toArray } from "../../../store/helpers/indexer";
import { useIOSelector } from "../../../store/hooks";
import customVariables from "../../../theme/variables";
import { getFullLocale } from "../../../utils/locale";
import {
  addTicketCustomField,
  hasSubCategories
} from "../../../utils/supportAssistance";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
import { ZendeskParamsList } from "../navigation/params";
import ZENDESK_ROUTES from "../navigation/routes";
import {
  zendeskSelectedCategory,
  zendeskSupportFailure
} from "../store/actions";
import { zendeskConfigSelector } from "../store/reducers";

export type ZendeskChooseCategoryNavigationParams = {
  assistanceForPayment: boolean;
};

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<ZendeskParamsList, "ZENDESK_CHOOSE_CATEGORY">
  >;
};

/**
 * this screen shows the categories for which the user can ask support with the assistance
 */
const ZendeskChooseCategory = (props: Props) => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<
      IOStackNavigationProp<ZendeskParamsList, "ZENDESK_CHOOSE_CATEGORY">
    >();
  const assistanceForPayment = props.navigation.getParam(
    "assistanceForPayment"
  );
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
      <ListItem
        onPress={() => {
          selectedCategory(category);
          // Set category as custom field
          addTicketCustomField(categoriesId, category.value);
          if (hasSubCategories(category)) {
            navigation.navigate(ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY, {
              assistanceForPayment
            });
          } else {
            navigation.navigate(ZENDESK_ROUTES.ASK_PERMISSIONS, {
              assistanceForPayment
            });
          }
        }}
        first={listItem.index === 0}
        style={{ paddingRight: 0 }}
        testID={category.value}
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
