import {
  Avatar,
  BlockButtons,
  ButtonText,
  ForceScrollDownView,
  H2,
  H6,
  hexToRgba,
  HSpacer,
  Icon,
  IOColors,
  IOStyles,
  Label,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";
import I18n from "../../../../i18n";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { logoForService } from "../../../services/home/utils";
import {
  computeAndTrackDataShare,
  computeAndTrackDataShareAccepted
} from "../../common/utils";
import { useAutoFetchingServiceByIdPot } from "../../common/utils/hooks";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
import { ConsentData } from "../types";
import { FimsClaimsList } from "./FimsClaims";
import { FimsMissingDataErrorScreen } from "./FimsErrorScreens";
import { FimsPrivacyInfo } from "./FimsPrivacyInfo";

type FimsSuccessBodyProps = { consents: ConsentData; onAbort: () => void };

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
  }, [serviceId, serviceData, store]);

  // -------- ERROR LOGIC

  if (pot.isError(servicePot) || isPrivacyUrlMissing) {
    return <FimsMissingDataErrorScreen />;
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
      <Label>
        <Label weight="Regular">{I18n.t("FIMS.consentsScreen.subtitle")}</Label>
        <Label weight="Bold">{serviceData.organization_name}</Label>
        <Label weight="Regular">
          {I18n.t("FIMS.consentsScreen.subtitle2")}
        </Label>
        <Label weight="Bold">{consents.redirect.display_name ?? ""}.</Label>
      </Label>
    ) : (
      <LoadingSkeleton lines={3} />
    );

  return (
    <>
      <ForceScrollDownView
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={styles.flexSpaceBetween}
      >
        <View>
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
          <Subtitle />

          <VSpacer size={24} />
          <ButtonText
            weight="Bold"
            color="blueIO-500"
            onPress={BottomSheet.present}
          >
            {I18n.t("global.why")}
          </ButtonText>
          <VSpacer size={24} />
          <ListItemHeader label="Dati richiesti" iconName="security" />
          <FimsClaimsList claims={consents.user_metadata} />
          <VSpacer size={24} />

          <FimsPrivacyInfo privacyUrl={privacyUrl} />

          <VSpacer size={32} />
        </View>
        <SafeAreaView>
          <BlockButtons
            type="TwoButtonsInlineHalf"
            primary={{
              type: "Outline",
              buttonProps: {
                label: I18n.t("global.buttons.cancel"),
                onPress: onAbort
              }
            }}
            secondary={{
              type: "Solid",
              buttonProps: {
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
              }
            }}
          />
        </SafeAreaView>
      </ForceScrollDownView>
      {BottomSheet.bottomSheet}
    </>
  );
};

type BSPropType = Parameters<typeof useIOBottomSheetModal>[0];
const generateBottomSheetProps = (
  privacyUrl: string | undefined
): BSPropType => ({
  title: I18n.t("FIMS.consentsScreen.bottomSheet.title"),
  component: (
    <>
      <Label weight="Regular">
        {I18n.t("FIMS.consentsScreen.bottomSheet.body")}
      </Label>
      <VSpacer size={8} />
      <Label weight="Regular">
        {I18n.t("FIMS.consentsScreen.bottomSheet.body2")}
        <H6
          onPress={() => privacyUrl && openWebUrl(privacyUrl)}
          color="blueIO-500"
        >
          {I18n.t("FIMS.consentsScreen.bottomSheet.bodyPrivacy")}
        </H6>
      </Label>
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
  flexSpaceBetween: {
    flex: 1,
    justifyContent: "space-between"
  },
  rowAlignCenter: { flexDirection: "row", alignItems: "center" }
});
