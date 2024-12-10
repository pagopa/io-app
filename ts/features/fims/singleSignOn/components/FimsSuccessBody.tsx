import {
  Avatar,
  Body,
  ButtonLink,
  ForceScrollDownView,
  H2,
  H6,
  hexToRgba,
  HSpacer,
  Icon,
  IOColors,
  IOStyles,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { Consent } from "../../../../../definitions/fims_sso/Consent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";
import I18n from "../../../../i18n";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { logoForService } from "../../../services/home/utils";
import {
  computeAndTrackDataShare,
  computeAndTrackDataShareAccepted
} from "../../common/analytics";
import { useAutoFetchingServiceByIdPot } from "../../common/hooks";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
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
  const privacyUrl = serviceData?.service_metadata?.privacy_url;
  const isPrivacyUrlMissing =
    pot.isSome(servicePot) && privacyUrl === undefined;

  // --------- HOOKS

  const BottomSheet = useIOBottomSheetModal(
    generateBottomSheetProps(privacyUrl)
  );

  React.useEffect(() => {
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
      service =>
        logoForService(service.service_id, service.organization_fiscal_code)
    )
  );

  const Subtitle = () =>
    serviceData !== undefined ? (
      <Body>
        <Body weight="Regular">{I18n.t("FIMS.consentsScreen.subtitle")}</Body>
        <Body weight="Semibold">{serviceData.organization_name}</Body>
        <Body weight="Regular">{I18n.t("FIMS.consentsScreen.subtitle2")}</Body>
        <Body weight="Semibold">{consents.redirect.display_name ?? ""}.</Body>
      </Body>
    ) : (
      <LoadingSkeleton lines={3} />
    );

  return (
    <ForceScrollDownView
      scrollEnabled
      threshold={150}
      contentContainerStyle={{
        minHeight: "100%"
      }}
    >
      <View
        style={[
          IOStyles.horizontalContentPadding,
          {
            flexGrow: 1
          }
        ]}
      >
        <VSpacer size={24} />
        <View style={styles.rowAlignCenter}>
          <View style={styles.outlineContainer}>
            <Icon name="productIOApp" size={30} color="blueIO-500" />
          </View>
          <HSpacer size={8} />
          <Icon name="transactions" color="grey-450" />
          <HSpacer size={8} />
          <Avatar logoUri={serviceLogo} size={"small"} />
        </View>

        <VSpacer size={24} />
        <H2>{I18n.t("FIMS.consentsScreen.title")}</H2>
        <VSpacer size={16} />
        <Subtitle />

        <VSpacer size={24} />
        <ButtonLink
          label={I18n.t("global.why")}
          onPress={BottomSheet.present}
        />
        <VSpacer size={24} />
        <ListItemHeader label="Dati richiesti" iconName="security" />
        <FimsClaimsList claims={consents.user_metadata} />
        <VSpacer size={24} />

        <FimsPrivacyInfo privacyUrl={privacyUrl} />

        <VSpacer size={32} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.consent"),
            icon: "security",
            iconPosition: "end",
            onPress: () => {
              const state = store.getState();
              computeAndTrackDataShareAccepted(serviceId, state);
              dispatch(
                fimsGetRedirectUrlAndOpenIABAction.request(
                  // eslint-disable-next-line no-underscore-dangle
                  { acceptUrl: consents._links.consent.href, serviceId }
                )
              );
            }
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: onAbort
          }
        }}
      />
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
        <H6
          onPress={() => privacyUrl && openWebUrl(privacyUrl)}
          color="blueIO-500"
        >
          {I18n.t("FIMS.consentsScreen.bottomSheet.bodyPrivacy")}
        </H6>
      </Body>
    </>
  ),
  snapPoint: [340]
});

const styles = StyleSheet.create({
  outlineContainer: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: hexToRgba(IOColors.black, 0.1)
  },
  rowAlignCenter: { flexDirection: "row", alignItems: "center" }
});
