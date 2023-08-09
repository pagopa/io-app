import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import * as O from "fp-ts/lib/Option";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import ScreenContent from "../../../../../components/screens/ScreenContent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { H4 } from "../../../../../components/core/typography/H4";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import ItwFooterInfoBox from "../../../components/ItwFooterInfoBox";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { itwActivationStop } from "../../../store/actions/itwActivationActions";
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

const ItwPidAttributesScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const decodedPid = useIOSelector(itwDecodedPidValueSelector); // We are not sure the decoded already happened, this is used as a placeholder
  const placeholder = "placeholder";

  const notNowButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: () => {
      dispatch(itwActivationStop());
    },
    title: I18n.t(
      "features.itWallet.presentation.pidAttributesScreen.buttons.deny"
    )
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => navigation.navigate(ITW_ROUTES.ISSUING.PID_AUTH_INFO),
    title: I18n.t(
      "features.itWallet.presentation.pidAttributesScreen.buttons.confirmData"
    )
  };

  const DecodedPidOrErrorView = () =>
    pipe(
      decodedPid,
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        decodedPid => <ContentView decodedPid={decodedPid} />
      )
    );

  const ContentView = ({ decodedPid }: { decodedPid: PidWithToken }) => (
    <>
      <ScreenContent
        title={I18n.t(
          "features.itWallet.presentation.pidAttributesScreen.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.presentation.pidAttributesScreen.subTitle"
        )}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <ListItemInfo
            label={I18n.t("features.itWallet.generic.rp")}
            icon="institution"
            value={placeholder}
            accessibilityLabel="test"
            action={
              <IOBadge small text={placeholder} variant="solid" color="blue" />
            }
          />
          <ItemSeparatorComponent noPadded />
          <ListItemComponent
            title={I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.requiredData.title"
            )}
            subTitle={I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.requiredData.subTitle"
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
              "features.itWallet.presentation.pidAttributesScreen.wrongClaims.title"
            )}
            <Link onPress={() => null}>
              {I18n.t(
                "features.itWallet.presentation.pidAttributesScreen.wrongClaims.reportLink"
              )}
            </Link>
          </H4>
          <VSpacer />
          <ItemSeparatorComponent noPadded />
          <VSpacer />
          <FeatureInfo
            iconName="externalLink"
            body={I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.privacy.thirdParty"
            )}
          />
          <VSpacer />
          <FeatureInfo
            iconName="hourglass"
            body={I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.privacy.preservation",
              {
                numberOfMonths: placeholder
              }
            )}
          />
          <VSpacer />
          <FeatureInfo
            iconName="trashcan"
            body={I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.privacy.deletion"
            )}
          />
          <VSpacer />
          <Link onPress={() => null}>
            {I18n.t(
              "features.itWallet.presentation.pidAttributesScreen.privacy.conditionsLink"
            )}
          </Link>
        </View>

        {/* Footer ToS and privacy link */}
        <ItwFooterInfoBox
          content={I18n.t(
            "features.itWallet.presentation.pidAttributesScreen.tos",
            {
              relayingParty: placeholder
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

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.presentation.pidAttributesScreen.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <DecodedPidOrErrorView />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwPidAttributesScreen;
