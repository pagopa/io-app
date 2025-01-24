import {
  FooterActionsInline,
  H4,
  H6,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
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
              <H6>{cdcInfo.sponsorship_description}</H6>
              <H4>{bonusTypeLocalizedContent.title}</H4>
            </View>
            {cdcLogo && (
              <Image
                accessibilityIgnoresInvertColors
                source={cdcLogo}
                style={styles.logo}
              />
            )}
          </View>
          <VSpacer size={16} />
          {/* Replace the following chunk of code with IOMarkdown */}
          {/* <IORenderHtml
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
          /> */}
          <VSpacer size={16} />
        </ScrollView>
      </SafeAreaView>
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.cancel"),
          onPress: () => {
            navigation.getParent()?.goBack();
          }
        }}
        endAction={{
          color: "primary",
          label: I18n.t("global.buttons.continue"),
          onPress: () => {
            navigation.navigate(CDC_ROUTES.SELECT_BONUS_YEAR);
          }
        }}
      />
    </BaseScreenComponent>
  );
};

export default CdcBonusRequestInformationTos;
