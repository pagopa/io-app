import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Link } from "../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../../utils/url";
import { IDPayUnsubscriptionRoutes } from "../../../unsubscription/navigation/navigator";
import {
  BeneficiaryDetailsContent,
  BeneficiaryDetailsContentSkeleton
} from "../components/BeneficiaryDetailsContent";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
  initiativeName?: string;
};

type BeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const BeneficiaryDetailsScreen = () => {
  const route = useRoute<BeneficiaryDetailsScreenRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const { initiativeId, initiativeName } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
  });

  const beneficiaryDetailsPot = useIOSelector(idPayBeneficiaryDetailsSelector);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);

  const handlePrivacyLinkPress = () =>
    pipe(
      beneficiaryDetailsPot,
      pot.toOption,
      O.chain(({ privacyLink }) => O.fromNullable(privacyLink)),
      O.map(openWebUrl),
      O.toUndefined
    );

  const handleUnsubscribePress = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      initiativeId,
      initiativeName
    });

  const content = pipe(
    sequenceS(O.Monad)({
      initiativeDetails: pipe(initiativeDetailsPot, pot.toOption),
      beneficiaryDetails: pipe(beneficiaryDetailsPot, pot.toOption)
    }),
    O.fold(
      () => <BeneficiaryDetailsContentSkeleton />,
      props => <BeneficiaryDetailsContent {...props} />
    )
  );

  const headerTitle = pipe(
    initiativeDetailsPot,
    pot.toOption,
    O.fold(
      () => initiativeName,
      details => details.initiativeName
    )
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <ScrollView scrollIndicatorInsets={{ right: 1 }}>
        <ContentWrapper>
          {content}
          <VSpacer size={24} />
          <View style={styles.linkRow}>
            <Link onPress={handlePrivacyLinkPress}>
              {I18n.t("idpay.initiative.beneficiaryDetails.buttons.privacy")}
            </Link>
          </View>
          <View style={styles.linkRow}>
            <Link onPress={handleUnsubscribePress} color="red">
              {I18n.t(
                "idpay.initiative.beneficiaryDetails.buttons.unsubscribe",
                {
                  initiativeName
                }
              )}
            </Link>
          </View>
          <VSpacer size={48} />
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  linkRow: {
    paddingVertical: 16
  }
});

export default BeneficiaryDetailsScreen;
