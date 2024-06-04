import {
  Avatar,
  BlockButtons,
  ButtonText,
  Divider,
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
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Link } from "../../../components/core/typography/Link";
import { LoadingSkeleton } from "../../../components/ui/Markdown/LoadingSkeleton";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";
import { loadServiceDetail } from "../../services/details/store/actions/details";
import { serviceByIdSelector } from "../../services/details/store/reducers/servicesById";
import { logoForService } from "../../services/home/utils";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
import { ConsentData, FimsClaimType } from "../types";

type FimsSuccessBodyProps = { consents: ConsentData };

export const FimsFlowSuccessBody = ({ consents }: FimsSuccessBodyProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const serviceId = consents.service_id as NonEmptyString;

  const serviceData = useIOSelector(state =>
    serviceByIdSelector(state, serviceId)
  );

  React.useEffect(() => {
    if (serviceData === undefined) {
      dispatch(loadServiceDetail.request(serviceId));
    }
  }, [serviceData, serviceId, dispatch]);

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
        <Label weight="Bold">{consents.redirection.display_name}.</Label>
      </Label>
    ) : (
      <LoadingSkeleton lines={3} />
    );
  const privacyUrl = serviceData?.service_metadata?.privacy_url;

  const BottomSheet = useIOBottomSheetModal({
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

  return (
    <>
      <ForceScrollDownView
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-between"
        }}
      >
        <View>
          <VSpacer size={24} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          <ClaimsList claims={consents.claims} />
          <VSpacer size={24} />

          <PrivacyInfo privacyUrl={privacyUrl} />

          <VSpacer size={32} />
        </View>
        <SafeAreaView>
          <BlockButtons
            type="TwoButtonsInlineHalf"
            primary={{
              type: "Outline",
              buttonProps: {
                label: I18n.t("global.buttons.cancel"),
                onPress: () => {
                  // BE call consents._links.cancel
                  navigation.goBack();
                }
              }
            }}
            secondary={{
              type: "Solid",
              buttonProps: {
                label: I18n.t("global.buttons.consent"),
                icon: "security",
                iconPosition: "end",
                onPress: () =>
                  dispatch(
                    fimsGetRedirectUrlAndOpenIABAction.request(
                      // eslint-disable-next-line no-underscore-dangle
                      { acceptUrl: consents._links.confirm.href }
                    )
                  )
              }
            }}
          />
        </SafeAreaView>
      </ForceScrollDownView>
      {BottomSheet.bottomSheet}
    </>
  );
};

const ClaimsList = ({ claims }: ClaimsListProps) => (
  <View style={styles.grantsList}>
    {claims.map((claim, index) => (
      <React.Fragment key={index}>
        <CLaimListItem label={claim.display_name} />
        {index < claims.length - 1 && <Divider />}
      </React.Fragment>
    ))}
  </View>
);

const CLaimListItem = ({ label }: ClaimsListItemProps) => (
  <View style={styles.grantItem}>
    <H6>{label}</H6>
    <Icon name="checkTickBig" size={24} color="grey-300" />
  </View>
);

const PrivacyInfo = ({ privacyUrl }: PrivacyInfoProps) =>
  privacyUrl !== undefined ? (
    <Label weight="Regular">
      {I18n.t("FIMS.consentsScreen.privacy1")}
      <Link onPress={() => openWebUrl(privacyUrl)}>
        {I18n.t("FIMS.consentsScreen.privacyCta")}
      </Link>
    </Label>
  ) : (
    <LoadingSkeleton lines={2} />
  );

const styles = StyleSheet.create({
  grantsList: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  grantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  outlineContainer: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: hexToRgba(IOColors.black, 0.1)
  }
});

type ClaimsListProps = {
  claims: ReadonlyArray<FimsClaimType>;
};
type PrivacyInfoProps = { privacyUrl?: string };
type ClaimsListItemProps = { label: string };
