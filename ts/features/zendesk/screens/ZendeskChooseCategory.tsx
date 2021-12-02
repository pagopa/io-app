import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";

const ZendeskChooseCategory = () => (
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
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );

export default ZendeskChooseCategory;
