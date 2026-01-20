import {
  Alert,
  ContentWrapper,
  H4,
  hexToRgba,
  IOColors,
  IOToast,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";

import I18n from "i18next";
import { ReactElement } from "react";
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
import {
  BonusCardScreenComponent,
  BonusScreenComponentProps
} from "../../../../components/BonusCard";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../store/actions/types";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  cgnMerchantVersionSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { formatDateAsShortFormat } from "../../../../utils/dates";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { capitalizeTextName } from "../../../../utils/strings";
import { openWebUrl } from "../../../../utils/url";
import { profileSelector } from "../../../settings/common/store/selectors";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import { availableBonusTypesSelectorFromId } from "../../common/store/selectors";
import { ID_CGN_TYPE } from "../../common/utils";
import { CgnAnimatedBackground } from "../components/CgnAnimatedBackground";
import { CgnCardStatus } from "../components/CgnCardStatus";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import CgnUnsubscribe from "../components/detail/CgnUnsubscribe";
import EycaDetailComponent from "../components/detail/eyca/EycaDetailComponent";
import { useCgnUnsubscribe } from "../hooks/useCgnUnsubscribe";
import { CgnDetailsParamsList } from "../navigation/params";
import CGN_ROUTES from "../navigation/routes";
import { cgnActivationStart } from "../store/actions/activation";
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

export const cgnCardColors: BonusScreenComponentProps["cardColors"] = {
  light: {
    background: "#f4f5f8",
    foreground: "#c8c3dc",
    text: "blueItalia-850"
  },
  dark: {
    background: IOColors["grey-850"],
    foreground: hexToRgba("#A58DFF", 0.4),
    text: "blueIO-50"
  }
};

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): ReactElement => {
  const navigation =
    useNavigation<IOStackNavigationProp<CgnDetailsParamsList, "CGN_DETAILS">>();
  const dispatch = useIODispatch();

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

  const theme = useIOTheme();

  const startCgnActiviation = () => {
    dispatch(loadAvailableBonuses.request());
    dispatch(cgnActivationStart());
  };

  if (pot.isError(props.potCgnDetails)) {
    // subText is a blank space to avoid default value when it is undefined
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t("wallet.methodDetails.error.title")}
        isHeaderVisible
        subtitle={I18n.t("wallet.methodDetails.error.subtitle")}
        action={{
          label: I18n.t("global.buttons.close"),
          onPress: navigation.goBack
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.retry"),
          onPress: loadCGN
        }}
      />
    );
  }

  if (props.isCgnInfoLoading || isLoading(props.unsubscriptionStatus)) {
    return <BonusCardScreenComponent isLoading cardColors={cgnCardColors} />;
  }

  const showDiscoverCta =
    props.isCgnEnabled && props.cgnDetails?.status === StatusEnum.ACTIVATED;

  const onPressShowCgnDiscounts = () => {
    navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES);
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

  if (!props.cgnDetails) {
    return (
      <OperationResultScreenContent
        pictogram="cardFavourite"
        isHeaderVisible
        title={I18n.t("bonus.cgn.detail.empty.title")}
        subtitle={I18n.t("bonus.cgn.detail.empty.subtitle")}
        action={{
          label: I18n.t("bonus.cgn.detail.empty.activateCta"),
          onPress: startCgnActiviation
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: navigation.goBack
        }}
      />
    );
  }

  return (
    <BonusCardScreenComponent
      logoUris={logoUris}
      name={I18n.t("bonus.cgn.name")}
      title={I18n.t("bonus.cgn.name")}
      organizationName={I18n.t("bonus.cgn.departmentName")}
      cardBackground={<CgnAnimatedBackground colors={cgnCardColors} />}
      actions={footerActions}
      status={
        props.cgnDetails ? <CgnCardStatus card={props.cgnDetails} /> : undefined
      }
      cardColors={cgnCardColors}
      cardFooter={
        <H4
          color={theme["textHeading-default"]}
          style={{
            textAlign: "center",
            marginHorizontal: 16,
            marginBottom: 16
          }}
        >
          {pot.isSome(currentProfile)
            ? `${capitalizeTextName(
                currentProfile.value.name
              )} ${capitalizeTextName(currentProfile.value.family_name)}`
            : ""}
        </H4>
      }
    >
      <VSpacer size={16} />
      <ContentWrapper style={{ flex: 1 }}>
        <VStack space={16}>
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
          {/* Ownership block rendering owner's fiscal code */}
          <CgnOwnershipInformation />
          {/* Renders status information including activation
          and expiring date and a badge that represents the CGN status
          ACTIVATED - EXPIRED - REVOKED */}
          {props.cgnDetails && <CgnStatusDetail cgnDetail={props.cgnDetails} />}
          {canDisplayEycaDetails && <EycaDetailComponent />}
          {CardActivated.is(props.cgnDetails) && <CgnUnsubscribe />}
        </VStack>
      </ContentWrapper>
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
  loadCgnDetails: () => dispatch(cgnDetails.request())
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
