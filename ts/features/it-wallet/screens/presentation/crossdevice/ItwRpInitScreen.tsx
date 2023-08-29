import React from "react";
import { SafeAreaView, View } from "react-native";
import { IOColors, ListItemInfo } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { sequenceS } from "fp-ts/lib/Apply";
import { RpEntityConfiguration } from "@pagopa/io-react-native-wallet/lib/typescript/rp/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import ScreenContent from "../../../../../components/screens/ScreenContent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { H4 } from "../../../../../components/core/typography/H4";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import ItwFooterInfoBox from "../../../components/ItwFooterInfoBox";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { itwDecodedPidValueSelector } from "../../../store/reducers/itwPidDecodeReducer";
import ItwPidClaimsList from "../../../components/ItwPidClaimsList";
import ItwErrorView from "../../../components/ItwErrorView";
import { cancelButtonProps } from "../../../utils/itwButtonsUtils";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { Link } from "../../../../../components/core/typography/Link";
import { FeatureInfo } from "../../../../../components/FeatureInfo";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  itwRpStart,
  itwRpStop,
  itwRpUserRejected
} from "../../../store/actions/itwRpActions";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  ItwRpInitializationType,
  itwRpInitializationSelector
} from "../../../store/reducers/itwRpInitializationReducer";
import ItwLoadingSpinner from "../../../components/ItwLoadingSpinner";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import { openWebUrl } from "../../../../../utils/url";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";

/**
 * ItwRpInitScreenNavigationParams's navigation params.
 * The authReqUrl is the url to use to start the RP flow.
 */
export type ItwRpInitScreenNavigationParams = {
  authReqUrl: string;
};

/**
 * Type of the route props for the ItwPidRequestScreen.
 */
type ItwRpInitScreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_PRESENTATION_CROSS_DEVICE_INIT"
>;

const ItwRpInitScreen = () => {
  const route = useRoute<ItwRpInitScreenRouteProps>();
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const initStatus = useIOSelector(itwRpInitializationSelector);
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);

  /**
   * Props for the not now button.
   * Stops the RP flow.
   */
  const notNowButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: () => {
      dispatch(itwRpUserRejected());
    },
    title: I18n.t(
      "features.itWallet.presentation.initializationScreen.buttons.deny"
    )
  };

  /**
   * Props for the continue button.
   * Confirms the data and navigates to the result screen.
   */
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => {
      navigation.navigate(ITW_ROUTES.PRESENTATION.CROSS_DEVICE.RESULT);
    },
    title: I18n.t(
      "features.itWallet.presentation.initializationScreen.buttons.confirmData"
    )
  };

  /**
   * Dispatches the action to start the RP flow on first render.
   */
  useOnFirstRender(() => {
    dispatch(itwRpStart(route.params.authReqUrl));
  });

  /**
   * Renders the content of the screen if the PID is decoded, an error otherwise.
   * @param rp - the RP data to display
   */
  const ContentView = ({ rp }: { rp: ItwRpInitializationType }) =>
    pipe(
      sequenceS(O.Applicative)({
        rpEntityConfig: rp.entity,
        requestObject: rp.requestObject,
        decodedPid
      }),
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        some => (
          <RpPreviewView
            decodedPid={some.decodedPid}
            rpEntityConfig={some.rpEntityConfig}
          />
        )
      )
    );

  /**
   * The actual content of the screen which includes a preview of the data shared with the RP and its data.
   * @param rp - the RP data to display
   * @param decodedPid - the decoded PID
   */
  const RpPreviewView = ({
    decodedPid,
    rpEntityConfig
  }: {
    decodedPid: PidWithToken;
    rpEntityConfig: RpEntityConfiguration;
  }) => {
    const { organization_name, policy_uri } =
      rpEntityConfig.payload.metadata.federation_entity;
    return (
      <>
        <ScreenContent
          title={I18n.t(
            "features.itWallet.presentation.initializationScreen.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.presentation.initializationScreen.subTitle"
          )}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <ListItemInfo
              label={I18n.t("features.itWallet.generic.rp")}
              icon="institution"
              value={organization_name}
              accessibilityLabel="test"
              action={
                <IOBadge
                  small
                  text={organization_name}
                  variant="solid"
                  color="blue"
                />
              }
            />
            <ItemSeparatorComponent noPadded />
            <ListItemComponent
              title={I18n.t(
                "features.itWallet.presentation.initializationScreen.requiredData.title"
              )}
              subTitle={I18n.t(
                "features.itWallet.presentation.initializationScreen.requiredData.subTitle"
              )}
              hideIcon
              hideSeparator
            />
            <ItwPidClaimsList
              decodedPid={decodedPid}
              claims={["givenName", "familyName", "birthdate", "taxIdCode"]}
            />
            <VSpacer />
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t(
                "features.itWallet.presentation.initializationScreen.wrongClaims.title"
              )}
              <Link onPress={() => null}>
                {I18n.t(
                  "features.itWallet.presentation.initializationScreen.wrongClaims.reportLink"
                )}
              </Link>
            </H4>
            <VSpacer />
            <ItemSeparatorComponent noPadded />
            <VSpacer />
            <FeatureInfo
              iconName="externalLink"
              body={I18n.t(
                "features.itWallet.presentation.initializationScreen.privacy.thirdParty"
              )}
            />
            <VSpacer />
            <FeatureInfo
              iconName="hourglass"
              body={I18n.t(
                "features.itWallet.presentation.initializationScreen.privacy.preservation",
                {
                  numberOfMonths: "6"
                }
              )}
            />
            <VSpacer />
            <FeatureInfo
              iconName="trashcan"
              body={I18n.t(
                "features.itWallet.presentation.initializationScreen.privacy.deletion"
              )}
            />
            <VSpacer />
            <Link onPress={() => openWebUrl(policy_uri)}>
              {I18n.t(
                "features.itWallet.presentation.initializationScreen.privacy.conditionsLink"
              )}
            </Link>
          </View>

          {/* Footer ToS and privacy link */}
          <ItwFooterInfoBox
            content={I18n.t(
              "features.itWallet.presentation.initializationScreen.tos",
              {
                relayingParty: organization_name
              }
            )}
          />
          <VSpacer />
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={notNowButtonProps}
          rightButton={continueButtonProps}
        />
      </>
    );
  };

  /*
   * Fixed loading view.
   */
  const LoadingView = () => <ItwLoadingSpinner color={IOColors.blue} />;

  /**
   * Error view with a single button which stops the RP flow.
   * @param error - the ItWalletError to display.
   */
  const ErrorView = ({ error }: { error: ItWalletError }) => (
    <ItwErrorView
      type="SingleButton"
      leftButton={cancelButtonProps(() => dispatch(itwRpStop()))}
      error={error}
    />
  );

  /**
   * Render mask which folds the initialization status of the RP flow.
   */
  const RenderMask = () =>
    pot.fold(
      initStatus,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      some => <ContentView rp={some} />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => <ErrorView error={err} />
    );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.presentation.initializationScreen.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <RenderMask />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwRpInitScreen;
