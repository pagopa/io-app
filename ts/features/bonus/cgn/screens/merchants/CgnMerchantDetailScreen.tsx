import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView
} from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import {
  sampleMerchant,
  TmpDiscountType
} from "../../__mock__/availableMerchantDetail";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { openWebUrl } from "../../../../../utils/url";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { H2 } from "../../../../../components/core/typography/H2";
import I18n from "../../../../../i18n";
import CgnMerchantDiscountItem from "../../components/merchants/CgnMerchantsDiscountItem";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const CgnMerchantDetailScreen: React.FunctionComponent<Props> = ({
  merchantDetail
}: Props) => {
  const renderDiscountListItem = ({
    item
  }: ListRenderItemInfo<TmpDiscountType>) => (
    <CgnMerchantDiscountItem discount={item} />
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={merchantDetail.name}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.flex]} bounces={false}>
          <View style={{ paddingHorizontal: 16 }}>
            <Image
              source={{ uri: merchantDetail.cover }}
              style={{
                width: "100%",
                height: 230,
                resizeMode: "cover",
                borderRadius: 12
              }}
            />
          </View>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer large />
            <H1>{merchantDetail.name}</H1>
            <H4 weight={"Regular"}>{merchantDetail.location}</H4>
            <View spacer />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.deals")}</H2>
            <View spacer small />
            <FlatList
              data={merchantDetail.discounts}
              renderItem={renderDiscountListItem}
            />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.description")}</H2>
            <H4 weight={"Regular"}>{merchantDetail.description}</H4>
            <View spacer large />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.services")}</H2>
            <H4 weight={"Regular"}>{merchantDetail.availableServices}</H4>
            <View spacer large />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.hours")}</H2>
            <H4 weight={"Regular"}>{merchantDetail.workingHours}</H4>
            <View spacer large />
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            () => openWebUrl(merchantDetail.url),
            I18n.t("bonus.cgn.merchantDetail.cta.label")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({
  // FIXME replace with the selector when API and store are linked
  merchantDetail: sampleMerchant
});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantDetailScreen);
