import { useNavigation } from "@react-navigation/native";
import * as AR from "fp-ts/lib/Array";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import cashbackLogo from "../../../../../img/bonus/bpd/logo_cashback_blue.png";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  loadServiceDetail,
  showServiceDetails
} from "../../../../store/actions/services";
import { Dispatch } from "../../../../store/actions/types";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { getRemoteLocale } from "../../../../utils/messages";
import { showToast } from "../../../../utils/showToast";
import {
  availableBonusTypesSelectorFromId,
  serviceFromAvailableBonusSelector,
  supportedAvailableBonusSelector
} from "../../../bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import {
  ID_CDC_TYPE,
  ID_CGN_TYPE
} from "../../../bonus/bonusVacanze/utils/bonus";
import { bpdOnboardingStart } from "../../../bonus/bpd/store/actions/onboarding";
import { bpdEnabledSelector } from "../../../bonus/bpd/store/reducers/details/activation";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import { isCgnEnrolledSelector } from "../../../bonus/cgn/store/reducers/details";
import FeaturedCard from "./FeaturedCard";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type BonusUtils = {
  logo?: typeof cashbackLogo;
  handler: (bonus: BonusAvailable) => void;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.white,
    paddingTop: 14
  },
  scrollViewPadding: {
    paddingVertical: 15
  }
});

/**
 * this component shows an horizontal scrollview of items
 * an item represents a bonus that the app can handle (relative feature flag enabled and handler set) and its
 * visibility is 'visible' or 'experimental'
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const isCgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isCdcEnabled = useIOSelector(isCdcEnabledSelector);
  const cdcService = useIOSelector(
    serviceFromAvailableBonusSelector(ID_CDC_TYPE)
  );
  const cdcBonus = useIOSelector(
    availableBonusTypesSelectorFromId(ID_CDC_TYPE)
  );

  const bonusMap: Map<number, BonusUtils> = new Map<number, BonusUtils>([]);

  // If the cdc service is not loaded try to load it
  useEffect(() => {
    const cdcServiceId = cdcBonus?.service_id ?? undefined;
    if (isCdcEnabled && O.isNone(cdcService) && cdcServiceId) {
      dispatch(loadServiceDetail.request(cdcServiceId));
    }
  }, [cdcBonus, isCdcEnabled, cdcService, dispatch]);

  if (isCgnEnabled) {
    bonusMap.set(ID_CGN_TYPE, {
      logo: cgnLogo,
      handler: _ => props.startCgnActivation()
    });
  }

  if (isCdcEnabled) {
    bonusMap.set(ID_CDC_TYPE, {
      handler: _ => {
        pipe(
          cdcService,
          O.fold(
            () => {
              // TODO: add mixpanel tracking and alert: https://pagopa.atlassian.net/browse/AP-14
              showToast(I18n.t("bonus.cdc.serviceEntryPoint.notAvailable"));
            },
            s => () => {
              dispatch(showServiceDetails(s));
              navigation.navigate(ROUTES.SERVICES_NAVIGATOR, {
                screen: ROUTES.SERVICE_DETAIL,
                params: { serviceId: s.service_id }
              });
            }
          )
        );
      }
    });
  }

  // are there any bonus to activate?
  const anyBonusNotActive =
    (props.cgnActiveBonus === false && isCgnEnabled) || isCdcEnabled;

  return props.availableBonusesList.length > 0 && anyBonusNotActive ? (
    <View style={styles.container} testID={"FeaturedCardCarousel"}>
      <View style={IOStyles.horizontalContentPadding}>
        <H3 weight={"SemiBold"} color={"bluegreyDark"}>
          {I18n.t("wallet.featured")}
        </H3>
      </View>
      <ScrollView
        horizontal={true}
        style={[IOStyles.horizontalContentPadding, styles.scrollViewPadding]}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {AR.reverse([...props.availableBonusesList]).map((b, i) => {
          const handler = pipe(
            bonusMap.get(b.id_type),
            O.fromNullable,
            O.fold(
              () => constUndefined,
              bu => bu.handler
            )
          );
          const logo = pipe(
            bonusMap.get(b.id_type),
            O.fromNullable,
            O.fold(
              () => undefined,
              bu => bu.logo
            )
          );
          const currentLocale = getRemoteLocale();

          switch (b.id_type) {
            case ID_CGN_TYPE:
              return (
                props.cgnActiveBonus === false &&
                isCgnEnabled && (
                  <FeaturedCard
                    testID={"FeaturedCardCGNTestID"}
                    key={`featured_bonus_${i}`}
                    title={b[currentLocale].name}
                    image={logo}
                    isNew={true}
                    onPress={() => handler(b)}
                  />
                )
              );
            case ID_CDC_TYPE:
              return (
                isCdcEnabled && (
                  <FeaturedCard
                    testID={"FeaturedCardCDCTestID"}
                    key={`featured_bonus_${i}`}
                    title={b[currentLocale].name}
                    image={{ uri: b.cover }}
                    isNew={true}
                    onPress={() => handler(b)}
                  />
                )
              );
            default:
              return null;
          }
        })}
      </ScrollView>
    </View>
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  bpdActiveBonus: bpdEnabledSelector(state),
  cgnActiveBonus: isCgnEnrolledSelector(state),
  availableBonusesList: supportedAvailableBonusSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startBpdOnboarding: () => dispatch(bpdOnboardingStart()),
  startCgnActivation: () => dispatch(cgnActivationStart())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedCardCarousel);
