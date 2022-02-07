import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
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
import { useIODispatch } from "../../../../../store/hooks";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
import CGN_ROUTES from "../../navigation/routes";
import { cgnSelectedCategory } from "../../store/actions/categories";
import { H1 } from "../../../../../components/core/typography/H1";

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#17324D",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 4,
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
  const navigation = useNavigationContext();

  const renderCategoryElement = (
    info: ListRenderItemInfo<ProductCategoryEnum | "All">
  ) => {
    if (info.item === "All") {
      return (
        <LinearGradient
          colors={["#C51C82", "#E28DC0"]}
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

  const categoriesToArray: ReadonlyArray<ProductCategoryEnum | "All"> = [
    ...Object.entries(ProductCategoryEnum).map(value => value[1]),
    "All"
  ];

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <View style={IOStyles.horizontalContentPadding}>
            <H1>{I18n.t("bonus.cgn.merchantsList.categoriesList.title")}</H1>
            <View spacer large />
            <FlatList
              data={categoriesToArray}
              renderItem={renderCategoryElement}
              numColumns={2}
              keyExtractor={(item: ProductCategoryEnum | "All") => item}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
