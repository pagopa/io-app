import * as React from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import { View } from "native-base";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { getCategorySpecs } from "../../utils/filters";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { useIODispatch } from "../../../../../store/hooks";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnCategories,
  cgnSelectedCategory
} from "../../store/actions/categories";
import { H1 } from "../../../../../components/core/typography/H1";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import CgnMerchantCategoryItem from "../../components/merchants/CgnMerchantCategoryItem";
import { IOColors } from "../../../../../components/core/variables/IOColors";

const CgnMerchantsCategoriesSelectionScreen = () => {
  const dispatch = useIODispatch();
  const remoteCategories = useIOSelector(cgnCategoriesListSelector);
  const navigation = useNavigationContext();

  const loadCategories = () => {
    dispatch(cgnCategories.request());
  };

  useEffect(loadCategories, []);

  const renderCategoryElement = (
    info: ListRenderItemInfo<ProductCategoryEnum | "All">
  ) => {
    if (info.item === "All") {
      return (
        <CgnMerchantCategoryItem
          title={I18n.t("bonus.cgn.merchantDetail.categories.all")}
          colors={["#475A6D", "#E6E9F2"]}
          onPress={() => navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST)}
        />
      );
    }
    const specs = getCategorySpecs(info.item);

    return specs.fold(null, s => {
      const categoryIcon = (
        <View style={[{ alignItems: "flex-end" }]}>
          {s.icon({
            height: 32,
            width: 32,
            fill: IOColors.white,
            style: { justifyContent: "flex-end" }
          })}
        </View>
      );

      return (
        <CgnMerchantCategoryItem
          title={I18n.t(s.nameKey)}
          colors={s.colors}
          onPress={() => {
            dispatch(cgnSelectedCategory(s.type));
            navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY);
          }}
          child={categoryIcon}
        />
      );
    });
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryEnum | "All"> = [
    "All",
    ...Object.entries(ProductCategoryEnum).map(value => value[1])
  ];

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <H1>{I18n.t("bonus.cgn.merchantsList.categoriesList.title")}</H1>
        <View spacer large />
        <FlatList
          showsVerticalScrollIndicator={Platform.OS !== "ios"}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          style={IOStyles.flex}
          data={categoriesToArray}
          refreshing={isLoading(remoteCategories)}
          onRefresh={loadCategories}
          renderItem={renderCategoryElement}
          numColumns={2}
          keyExtractor={(item: ProductCategoryEnum | "All") => item}
          ListFooterComponent={<EdgeBorderComponent />}
        />
      </View>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
