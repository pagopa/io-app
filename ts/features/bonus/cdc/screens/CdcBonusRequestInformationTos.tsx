import * as React from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { CDC_ROUTES } from "../navigation/routes";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { CdcBonusRequestParamsList } from "../navigation/params";
import { H2 } from "../../../../components/core/typography/H2";
import { IORenderHtml } from "../../../../components/core/IORenderHtml";
import { useIOSelector } from "../../../../store/hooks";
import { availableBonusTypesSelectorFromId } from "../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CDC_TYPE } from "../../bonusVacanze/utils/bonus";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import { getRemoteLocale } from "../../../../utils/messages";
import { H4 } from "../../../../components/core/typography/H4";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    width: 48,
    height: 48
  },
  headerContainer: {
    ...IOStyles.row,
    justifyContent: "space-between"
  }
});
const CdcBonusRequestInformationTos = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_INFORMATION_TOS">
    >();
  const cdcInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_CDC_TYPE));
  const cdcLogo: ImageSourcePropType | undefined = cdcInfo?.sponsorship_cover
    ? { uri: cdcInfo?.sponsorship_cover }
    : undefined;

  const cancelButtonProps = {
    block: true,
    bordered: true,
    onPress: () => {
      navigation.getParent()?.goBack();
    },
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => {
      navigation.navigate(CDC_ROUTES.SELECT_BONUS_YEAR);
    },
    title: I18n.t("global.buttons.continue")
  };

  if (cdcInfo === undefined) {
    return null;
  }

  const bonusTypeLocalizedContent: BonusAvailableContent =
    cdcInfo[getRemoteLocale()];

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <View style={styles.headerContainer}>
            <View style={IOStyles.flex}>
              <H4 weight={"Regular"} color={"bluegrey"}>
                {cdcInfo.sponsorship_description}
              </H4>
              <H2>{bonusTypeLocalizedContent.title}</H2>
            </View>
            {cdcLogo && <Image source={cdcLogo} style={styles.logo} />}
          </View>
          <VSpacer size={16} />
          <IORenderHtml
            source={{
              html: bonusTypeLocalizedContent.content
            }}
            renderersProps={{
              ul: {
                markerBoxStyle: {
                  paddingRight: 10
                }
              }
            }}
            tagsStyles={{
              li: {
                lineHeight: 20
              },
              h4: {
                marginBottom: 0
              }
            }}
          />
          <VSpacer size={16} />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestInformationTos;
