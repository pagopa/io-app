import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import CieLoginConfigScreenContent from "./CieLoginConfigScreenContent";

const CieLoginConfigScreen = () => (
  <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <ContentWrapper>
          <CieLoginConfigScreenContent />
        </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

export default CieLoginConfigScreen;
