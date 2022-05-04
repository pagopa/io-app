import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../../i18n";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";

const CdcBonusRequestBonusRequested = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_SELECT_RESIDENCE">
    >();
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<ButtonDefaultOpacity transparent={true} />}
      headerTitle={I18n.t("bonus.cdc.title")}
      customRightIcon={{
        iconName: "io-close",
        onPress: () => {
          navigation.getParent()?.goBack();
        }
      }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"CdcBonusRequestBonusRequested"}</H1>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            block: true,
            onPress: () => {
              navigation.getParent()?.goBack();
            },
            title: I18n.t("bonus.cdc.bonusRequest.bonusRequested.cta")
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestBonusRequested;
