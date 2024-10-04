import {
  Alert,
  H4,
  IOStyles,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { Card } from "../../../../../definitions/cgn/Card";
import {
  CardActivated,
  StatusEnum
} from "../../../../../definitions/cgn/CardActivated";
import { CardExpired } from "../../../../../definitions/cgn/CardExpired";
import { CardRevoked } from "../../../../../definitions/cgn/CardRevoked";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../img/bonus/cgn/eyca_logo.png";
import { isLoading } from "../../../../common/model/RemoteValue";
import { BonusCardScreenComponent } from "../../../../components/BonusCard";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../store/actions/types";
import { useIOSelector } from "../../../../store/hooks";
import {
  cgnMerchantVersionSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { profileSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import { formatDateAsShortFormat } from "../../../../utils/dates";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { openWebUrl } from "../../../../utils/url";
import { availableBonusTypesSelectorFromId } from "../../common/store/selectors";
import { ID_CGN_TYPE } from "../../common/utils";
import { CgnAnimatedBackground } from "../components/CgnAnimatedBackground";
import { CgnCardStatus } from "../components/CgnCardStatus";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import CgnUnsubscribe from "../components/detail/CgnUnsubscribe";
import EycaDetailComponent from "../components/detail/eyca/EycaDetailComponent";
import { useCgnUnsubscribe } from "../hooks/useCgnUnsubscribe";
import { navigateToCgnMerchantsTabs } from "../navigation/actions";
import { CgnDetailsParamsList } from "../navigation/params";
import CGN_ROUTES from "../navigation/routes";
import { cgnDetails } from "../store/actions/details";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import {
  cgnDetailSelector,
  cgnDetailsInformationSelector,
  isCgnDetailsLoading
} from "../store/reducers/details";
import {
  eycaDetailSelector,
  EycaDetailsState
} from "../store/reducers/eyca/details";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { EYCA_WEBSITE_DISCOUNTS_PAGE_URL } from "../utils/constants";
import { canEycaCardBeShown } from "../utils/eyca";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

function getLogoUris(card: Card | undefined, eycaDetails: EycaDetailsState) {
  const canCgnLogoBeShown = CardActivated.is(card);
  const canDisplayEycaLogo =
    canCgnLogoBeShown && canEycaCardBeShown(eycaDetails);
  return [
    ...(canCgnLogoBeShown ? [cgnLogo] : []),
    ...(canDisplayEycaLogo ? [eycaLogo] : [])
  ];
}

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  const navigation =
    useNavigation<IOStackNavigationProp<CgnDetailsParamsList, "CGN_DETAILS">>();

  // to display EYCA info component the CGN initiative needs to be enabled by remote
  const canDisplayEycaDetails =
    canEycaCardBeShown(props.eycaDetails) &&
    props.isCgnEnabled &&
    CardActivated.is(props.cgnDetails);

  const loadCGN = () => {
    props.loadCgnDetails();
    props.loadEycaDetails();
  };

  useActionOnFocus(loadCGN);

  useHardwareBackButton(() => {
    navigation.goBack();
    return true;
  });

  const { requestUnsubscription } = useCgnUnsubscribe();

  const eycaDetails = useIOSelector(eycaDetailSelector);

  const logoUris = getLogoUris(props.cgnDetails, eycaDetails);

  const currentProfile = useIOSelector(profileSelector);

  if (pot.isError(props.potCgnDetails)) {
    // subText is a blank space to avoid default value when it is undefined
    return (
      <GenericErrorComponent
        subText={" "}
        onRetry={loadCGN}
        onCancel={navigation.goBack}
      />
    );
  }

  if (props.isCgnInfoLoading || isLoading(props.unsubscriptionStatus)) {
    return <BonusCardScreenComponent isLoading />;
  }

  const showDiscoverCta =
    props.isCgnEnabled && props.cgnDetails?.status === StatusEnum.ACTIVATED;

  const onPressShowCgnDiscounts = () => {
    if (props.isMerchantV2Enabled) {
      props.navigateToMerchantsTabs();
    } else {
      navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES);
    }
  };

  const footerActions: IOScrollViewActions | undefined = (() => {
    if (showDiscoverCta) {
      const primary = {
        label: canDisplayEycaDetails
          ? I18n.t("bonus.cgn.detail.cta.buyers")
          : I18n.t("bonus.cgn.detail.cta.discover"),
        onPress: onPressShowCgnDiscounts
      };

      const secondary = {
        label: I18n.t("bonus.cgn.detail.cta.eyca.showEycaDiscounts"),
        accessibilityLabel: I18n.t(
          "bonus.cgn.detail.cta.eyca.showEycaDiscounts"
        ),
        onPress: () =>
          openWebUrl(EYCA_WEBSITE_DISCOUNTS_PAGE_URL, () =>
            IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
          )
      };

      return canDisplayEycaDetails
        ? { type: "TwoButtons", primary, secondary }
        : { type: "SingleButton", primary };
    }

    if (CardExpired.is(props.cgnDetails)) {
      return {
        type: "SingleButton",
        primary: {
          color: "danger",
          label: I18n.t("bonus.cgn.activation.deactivate.expired"),
          onPress: requestUnsubscription
        }
      };
    }

    return undefined;
  })();

  return (
    <BonusCardScreenComponent
      logoUris={logoUris}
      name={I18n.t("bonus.cgn.name")}
      title={I18n.t("bonus.cgn.name")}
      organizationName={I18n.t("bonus.cgn.departmentName")}
      cardBackground={<CgnAnimatedBackground />}
      actions={footerActions}
      status={
        props.cgnDetails ? <CgnCardStatus card={props.cgnDetails} /> : undefined
      }
      cardFooter={
        <H4
          style={{
            textAlign: "center",
            marginHorizontal: 16,
            marginBottom: 16
          }}
        >
          {pot.isSome(currentProfile)
            ? `${currentProfile.value.name} ${currentProfile.value.family_name}`
            : ""}
        </H4>
      }
    >
      <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        {CardRevoked.is(props.cgnDetails) && (
          <Alert
            variant="error"
            content={I18n.t("bonus.cgn.detail.information.revoked", {
              reason: props.cgnDetails.revocation_reason
            })}
          />
        )}
        {CardExpired.is(props.cgnDetails) && (
          <Alert
            variant="error"
            content={I18n.t("bonus.cgn.detail.information.expired", {
              date: formatDateAsShortFormat(props.cgnDetails.expiration_date)
            })}
          />
        )}
        <VSpacer size={16} />
        <CgnOwnershipInformation
        // Ownership block rendering owner's fiscal code
        />
        <VSpacer size={16} />
        {props.cgnDetails && (
          // Renders status information including activation and expiring date and a badge that represents the CGN status
          // ACTIVATED - EXPIRED - REVOKED
          <CgnStatusDetail cgnDetail={props.cgnDetails} />
        )}
        {canDisplayEycaDetails && <EycaDetailComponent />}
        <VSpacer size={24} />
        {CardActivated.is(props.cgnDetails) && <CgnUnsubscribe />}
      </View>
      <SectionStatusComponent sectionKey={"cgn"} />
    </BonusCardScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  potCgnDetails: cgnDetailSelector(state),
  cgnDetails: cgnDetailsInformationSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCgnInfoLoading: isCgnDetailsLoading(state),
  isMerchantV2Enabled: cgnMerchantVersionSelector(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state),
  eycaDetails: eycaDetailSelector(state),
  unsubscriptionStatus: cgnUnsubscribeSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  unsubscribe: () => dispatch(cgnUnsubscribe.request()),
  loadEycaDetails: () => dispatch(cgnEycaStatus.request()),
  loadCgnDetails: () => dispatch(cgnDetails.request()),
  navigateToMerchantsTabs: () => navigateToCgnMerchantsTabs()
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
