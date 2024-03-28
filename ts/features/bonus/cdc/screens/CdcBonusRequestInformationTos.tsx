import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import { IORenderHtml } from "../../../../components/core/IORenderHtml";
import { H2 } from "../../../../components/core/typography/H2";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { getRemoteLocale } from "../../../messages/utils/messages";
import { availableBonusTypesSelectorFromId } from "../../common/store/selectors";
import { ID_CDC_TYPE } from "../../common/utils";
import { CdcBonusRequestParamsList } from "../navigation/params";
import { CDC_ROUTES } from "../navigation/routes";

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
      </SafeAreaView>
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: () => {
              navigation.getParent()?.goBack();
            }
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () => {
              navigation.navigate(CDC_ROUTES.SELECT_BONUS_YEAR);
            }
          }
        }}
      />
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestInformationTos;
