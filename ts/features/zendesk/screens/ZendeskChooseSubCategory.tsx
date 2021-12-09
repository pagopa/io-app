import React from "react";
import { FlatList, SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { zendeskSelectedCategorySelector } from "../store/reducers";
import { useDispatch } from "react-redux";
import { H4 } from "../../../components/core/typography/H4";
import { ListItem } from "native-base";
import customVariables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import { openSupportTicket } from "../../../utils/supportAssistance";
import { zendeskSupportCompleted } from "../store/actions";
import { getFullLocale } from "../../../utils/locale";

const ZendeskChooseSubCategory = () => {
  const selectedCategory = useIOSelector(zendeskSelectedCategorySelector);
  const dispatch = useDispatch();
  const zendeskWorkunitComplete = () => dispatch(zendeskSupportCompleted());

  // It should never happens since it is selected in the previous screen
  if (selectedCategory === undefined) {
    return <WorkunitGenericFailure />;
  }

  // It should never happens since it is checked in the previous screen
  if (
    selectedCategory.zendeskSubCategories === undefined ||
    selectedCategory.zendeskSubCategories.subCategories.length === 0
  ) {
    return <WorkunitGenericFailure />;
  }

  const subCategories = selectedCategory.zendeskSubCategories.subCategories;
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
      headerTitle={selectedCategory.description[locale]}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskChooseCategory"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("support.chooseCategory.title.subCategory")}</H1>
          <View spacer />
          <FlatList
            data={subCategories}
            keyExtractor={c => c.value}
            renderItem={i => (
              <ListItem
                onPress={() => {
                  // TODO: set sub-category as custom field
                  openSupportTicket();
                  zendeskWorkunitComplete();
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

export default ZendeskChooseSubCategory;
