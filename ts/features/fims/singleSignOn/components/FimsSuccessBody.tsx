import {
  Avatar,
  Body,
  ContentWrapper,
  ForceScrollDownView,
  H2,
  hexToRgba,
  HStack,
  Icon,
  IOButton,
  IOColors,
  IOVisualCostants,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { Consent } from "../../../../../definitions/fims_sso/Consent";
import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { logoForService } from "../../../services/home/utils";
import {
  computeAndTrackDataShare,
  computeAndTrackDataShareAccepted
} from "../../common/analytics";
import { useAutoFetchingServiceByIdPot } from "../../common/hooks";
import { fimsAcceptConsentsAction } from "../store/actions";
import { FimsClaimsList } from "./FimsClaims";
import { FimsSSOFullScreenError } from "./FimsFullScreenErrors";
import { FimsPrivacyInfo } from "./FimsPrivacyInfo";

type FimsSuccessBodyProps = { consents: Consent; onAbort: () => void };

export const FimsFlowSuccessBody = ({
  consents,
  onAbort
}: FimsSuccessBodyProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const serviceId = consents.service_id as ServiceId;

  const servicePot = useAutoFetchingServiceByIdPot(serviceId);
  const serviceData = pot.toUndefined(servicePot);
  const privacyUrl = serviceData?.metadata?.privacy_url;
  const isPrivacyUrlMissing =
    pot.isSome(servicePot) && privacyUrl === undefined;

  // --------- HOOKS

  const BottomSheet = useIOBottomSheetModal(
    generateBottomSheetProps(privacyUrl)
  );

  useEffect(() => {
    if (serviceData) {
      const state = store.getState();
      computeAndTrackDataShare(serviceData, state);
    }
  }, [serviceData, store]);

  // -------- ERROR LOGIC

  if (pot.isError(servicePot) || isPrivacyUrlMissing) {
    return <FimsSSOFullScreenError />;
  }

  const serviceLogo = pipe(
    serviceData,
    O.fromNullable,
    O.fold(
      () => undefined,
      service => logoForService(service.id, service.organization.fiscal_code)
    )
  );

  const Subtitle = () =>
    serviceData !== undefined ? (
      <Body>
        <Body weight="Regular">{I18n.t("FIMS.consentsScreen.subtitle")}</Body>
        <Body weight="Semibold">{serviceData.organization.name}</Body>
        <Body weight="Regular">{I18n.t("FIMS.consentsScreen.subtitle2")}</Body>
        <Body weight="Semibold">{consents.redirect.display_name ?? ""}.</Body>
      </Body>
    ) : (
      <LoadingSkeleton lines={3} />
    );

  return (
    <ForceScrollDownView
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.consent"),
            icon: "security",
            iconPosition: "end",
            onPress: () => {
              const state = store.getState();
              computeAndTrackDataShareAccepted(serviceId, state);
              dispatch(
                fimsAcceptConsentsAction(
                  // eslint-disable-next-line no-underscore-dangle
                  { acceptUrl: consents._links.consent.href }
                )
              );
            }
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: onAbort
          }
        }
      }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <HStack space={8} style={{ alignItems: "center" }}>
          {/* TODO: We need to add a variant of `Avatar` that
          lets you set a custom icon with a custom colour. */}
          <View style={styles.outlineContainer}>
            <Icon name="productIOApp" size={"100%"} color={"blueIO-500"} />
          </View>
          <Icon name="transactions" color="grey-450" />
          <Avatar logoUri={serviceLogo} size={"small"} />
        </HStack>

        <VSpacer size={24} />
        <H2 accessibilityRole="header">
          {I18n.t("FIMS.consentsScreen.title")}
        </H2>
        <VSpacer size={16} />
        <Subtitle />

        <VSpacer size={24} />
        <IOButton
          variant="link"
          label={I18n.t("global.why")}
          onPress={BottomSheet.present}
        />
        <VSpacer size={24} />
        <ListItemHeader label="Dati richiesti" iconName="security" />
        <FimsClaimsList claims={consents.user_metadata} />
        <VSpacer size={24} />

        <FimsPrivacyInfo privacyUrl={privacyUrl} />

        <VSpacer size={32} />
      </ContentWrapper>
      {BottomSheet.bottomSheet}
    </ForceScrollDownView>
  );
};

type BSPropType = Parameters<typeof useIOBottomSheetModal>[0];
const generateBottomSheetProps = (
  privacyUrl: string | undefined
): BSPropType => ({
  title: I18n.t("FIMS.consentsScreen.bottomSheet.title"),
  component: (
    <>
      <Body>{I18n.t("FIMS.consentsScreen.bottomSheet.body")}</Body>
      <VSpacer size={8} />
      <Body>
        {I18n.t("FIMS.consentsScreen.bottomSheet.body2")}
        <Body
          avoidPressable
          weight="Semibold"
          asLink
          onPress={() => privacyUrl && openWebUrl(privacyUrl)}
        >
          {I18n.t("FIMS.consentsScreen.bottomSheet.bodyPrivacy")}
        </Body>
      </Body>
    </>
  ),
  snapPoint: [340]
});

const styles = StyleSheet.create({
  outlineContainer: {
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderCurve: "continuous",
    backgroundColor: IOColors.white,
    width: IOVisualCostants.avatarSizeSmall,
    height: IOVisualCostants.avatarSizeSmall
  }
});
