import * as React from "react";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
import { View } from "native-base";
import { widthPercentageToDP } from "react-native-responsive-screen";
import LinearGradient from "react-native-linear-gradient";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { getCategorySpecs } from "../../utils/filters";
import customVariables from "../../../../../theme/variables";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnCategories,
  cgnSelectedCategory
} from "../../store/actions/categories";
import { H1 } from "../../../../../components/core/typography/H1";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { isLoading, isReady } from "../../../bpd/model/RemoteValue";

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    flex: 1,
    marginBottom: 10,
    marginRight: widthPercentageToDP("2.93%"),
    width: widthPercentageToDP("42.13%")
  },
  container: {
    flexDirection: "column",
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14
  }
});

const CgnMerchantsCategoriesSelectionScreen = () => {
  const dispatch = useIODispatch();
  const remoteCategories = useIOSelector(cgnCategoriesListSelector);
  const navigation = useNavigationContext();

  const loadCategories = () => {
    dispatch(cgnCategories.request());
  };

  useEffect(loadCategories, []);

  const renderCategoryElement = (
    info: ListRenderItemInfo<ProductCategoryEnum | "All" | "Hidden">
  ) => {
    if (info.item === "All") {
      return (
        <LinearGradient
          colors={["#475A6D", "#E6E9F2"]}
          useAngle={true}
          angle={57.23}
          style={styles.body}
        >
          <TouchableDefaultOpacity
            style={[IOStyles.flex, styles.container]}
            onPress={() =>
              navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST)
            }
          >
            <View style={[IOStyles.flex, IOStyles.row]}>
              <H2 color={"white"}>
                {I18n.t("bonus.cgn.merchantDetail.categories.all")}
              </H2>
            </View>
          </TouchableDefaultOpacity>
        </LinearGradient>
      );
    }
    if (info.item === "Hidden") {
      return (
        <View style={[styles.body, { height: 122 }]}>
          <View style={[IOStyles.flex, styles.container]} />
        </View>
      );
    }
    const specs = getCategorySpecs(info.item);

    return specs.fold(null, s => (
      <LinearGradient
        colors={s.colors}
        useAngle={true}
        angle={57.23}
        style={styles.body}
      >
        <TouchableDefaultOpacity
          style={[IOStyles.flex, styles.container]}
          onPress={() => {
            dispatch(cgnSelectedCategory(s.type));
            navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY);
          }}
        >
          <View style={[IOStyles.flex, IOStyles.row]}>
            <H2 color={"white"}>{I18n.t(s.nameKey)}</H2>
          </View>
          <View style={[{ alignItems: "flex-end" }]}>
            {s.icon({
              height: 32,
              width: 32,
              fill: IOColors.white,
              style: { justifyContent: "flex-end" }
            })}
          </View>
        </TouchableDefaultOpacity>
      </LinearGradient>
    ));
  };

  const categoriesToArray: ReadonlyArray<
    ProductCategoryEnum | "All" | "Hidden"
  > = [
    "All",
    ...(isReady(remoteCategories) ? remoteCategories.value : []),
    "Hidden"
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
        {isLoading(remoteCategories) ? (
          <ActivityIndicator animating={true} />
        ) : (
          <FlatList
            style={IOStyles.flex}
            data={categoriesToArray}
            refreshing={isLoading(remoteCategories)}
            onRefresh={loadCategories}
            renderItem={renderCategoryElement}
            numColumns={2}
            keyExtractor={(item: ProductCategoryEnum | "All" | "Hidden") =>
              item
            }
            ListFooterComponent={<EdgeBorderComponent />}
          />
        )}
      </View>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
