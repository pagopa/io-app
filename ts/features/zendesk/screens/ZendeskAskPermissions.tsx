import { RouteProp, useRoute } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { Link } from "../../../components/core/typography/Link";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { zendeskPrivacyUrl } from "../../../config";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  idpSelector,
  isLoggedIn,
  zendeskTokenSelector
} from "../../../store/reducers/authentication";
import { appVersionHistorySelector } from "../../../store/reducers/installation";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { getAppVersion } from "../../../utils/appVersion";
import { getModel, getSystemVersion } from "../../../utils/device";
import { getFullLocale } from "../../../utils/locale";
import { isIos } from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import {
  addTicketCustomField,
  addTicketTag,
  anonymousAssistanceAddress,
  anonymousAssistanceAddressWithSubject,
  AnonymousIdentity,
  initSupportAssistance,
  JwtIdentity,
  openSupportTicket,
  setUserIdentity,
  ZendeskAppConfig,
  zendeskCurrentAppVersionId,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig,
  zendeskDeviceAndOSId,
  zendeskidentityProviderId,
  zendeskVersionsHistoryId
} from "../../../utils/supportAssistance";
import { handleItemOnPress, openWebUrl } from "../../../utils/url";
import ZendeskItemPermissionComponent, {
  ItemPermissionProps
} from "../components/ZendeskItemPermissionComponent";
import { ZendeskParamsList } from "../navigation/params";
import {
  zendeskSupportCompleted,
  zendeskSupportFailure
} from "../store/actions";
import {
  zendeskSelectedCategorySelector,
  zendeskSelectedSubcategorySelector
} from "../store/reducers";
import { Icon } from "../../../components/core/icons/Icon";
import { IOColors } from "../../../components/core/variables/IOColors";

/**
 * Transform an array of string into a Zendesk
 * value to display.
 */
const arrayToZendeskValue = (arr: Array<string>) => arr.join(", ");

type ItemProps = {
  fiscalCode: string;
  nameSurname: string;
  email: string;
  deviceDescription: string;
  identityProvider: string;
};

const iconStyleProps = { size: 24, color: "blue" as IOColors };

const getItems = (props: ItemProps): ReadonlyArray<ItemPermissionProps> => [
  {
    id: "profileNameSurname",
    icon: <Icon name="profile" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.nameSurname"),
    value: props.nameSurname,
    testId: "profileNameSurname"
  },
  {
    id: "profileFiscalCode",
    icon: <Icon name="fiscalCodeIndividual" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.fiscalCode"),
    value: props.fiscalCode,
    testId: "profileFiscalCode"
  },
  {
    id: "profileEmail",
    icon: <Icon name="email" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.emailAddress"),
    value: props.email,
    testId: "profileEmail"
  },
  {
    id: "galleryProminentDisclosure",
    icon: <Icon name="gallery" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.prominentDisclosure"),
    value: I18n.t("support.askPermissions.prominentDisclosureData"),
    testId: "galleryProminentDisclosure"
  },
  {
    id: "paymentIssues",
    icon: <Icon name="docGiacenza" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.stock"),
    value: I18n.t("support.askPermissions.stockValue"),
    testId: "paymentIssues"
  },
  {
    id: "addCardIssues",
    icon: <Icon name="creditCard" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.card"),
    value: I18n.t("support.askPermissions.cardValue"),
    testId: "addCardIssues"
  },
  {
    icon: <Icon name="device" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.deviceAndOS"),
    value: props.deviceDescription,
    zendeskId: zendeskDeviceAndOSId,
    testId: "deviceAndOS"
  },
  {
    icon: <Icon name="battery" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.devicePerformance"),
    value: I18n.t("support.askPermissions.devicePerformanceData"),
    testId: "devicePerformance"
  },
  {
    icon: <Icon name="website" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.ipAddress"),
    value: I18n.t("support.askPermissions.ipAddressValue"),
    testId: "ipAddress"
  },
  {
    icon: <Icon name="info" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.appVersionsHistory"),
    value: I18n.t("support.askPermissions.appVersionsHistoryValue"),
    testId: "appVersionsHistory"
  },
  {
    icon: <Icon name="login" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.identityProvider"),
    value: props.identityProvider,
    zendeskId: zendeskidentityProviderId,
    testId: "identityProvider"
  },
  {
    icon: <Icon name="history" {...iconStyleProps} />,
    title: I18n.t("support.askPermissions.navigationData"),
    value: I18n.t("support.askPermissions.navigationDataValue"),
    testId: "navigationData"
  }
];

export type ZendeskAskPermissionsNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
};

/**
 * this screen shows the kinds of data the app could collect when a user is asking for assistance
 * @constructor
 */
const ZendeskAskPermissions = () => {
  const route =
    useRoute<RouteProp<ZendeskParamsList, "ZENDESK_ASK_PERMISSIONS">>();

  const { assistanceForPayment, assistanceForCard } = route.params;

  const dispatch = useIODispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());
  const notAvailable = I18n.t("global.remoteStates.notAvailable");
  const isUserLoggedIn = useIOSelector(s => isLoggedIn(s.authentication));
  const identityProvider = pipe(
    useIOSelector(idpSelector),
    O.map(idp => idp.name),
    O.getOrElse(() => notAvailable)
  );
  const fiscalCode = useIOSelector(profileFiscalCodeSelector) ?? notAvailable;
  const nameSurname = useIOSelector(profileNameSurnameSelector) ?? notAvailable;
  const email = pipe(
    useIOSelector(profileEmailSelector),
    O.getOrElse(() => notAvailable)
  );
  const versionsHistory = useIOSelector(appVersionHistorySelector);
  const zendeskSelectedCategory = useIOSelector(
    zendeskSelectedCategorySelector
  );
  const zendeskSelectedSubcategory = useIOSelector(
    zendeskSelectedSubcategorySelector
  );
  const zendeskToken = useIOSelector(zendeskTokenSelector);

  useEffect(() => {
    const zendeskConfig = pipe(
      zendeskToken,
      O.fromNullable,
      O.map(
        (zT: string): ZendeskAppConfig => ({
          ...zendeskDefaultJwtConfig,
          token: zT
        })
      ),
      O.getOrElseW(() => zendeskDefaultAnonymousConfig)
    );

    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = pipe(
      zendeskToken,
      O.fromNullable,
      O.map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      })),
      O.getOrElseW(() => ({}))
    );

    setUserIdentity(zendeskIdentity);
  }, [dispatch, zendeskToken]);

  const currentVersion = getAppVersion();

  const itemsProps: ItemProps = {
    fiscalCode,
    nameSurname,
    email,
    deviceDescription: `${getModel()} · ${
      isIos ? "iOS" : "Android"
    } · ${getSystemVersion()}`,
    identityProvider
  };

  // It should never happens since it is selected in the previous screen
  if (zendeskSelectedCategory === undefined) {
    dispatch(zendeskSupportFailure("The category has not been selected"));
    return null;
  }

  const itemsToRemove: ReadonlyArray<string> = [
    // if user is not asking assistance for a payment, remove the related items from those ones shown
    ...(!assistanceForPayment ? ["paymentIssues"] : []),
    // if user is not asking assistance for a payment, remove the related items from those ones shown
    ...(!assistanceForCard ? ["addCardIssues"] : []),
    // if user is not logged in, remove the items related to his/her profile
    ...(!isUserLoggedIn
      ? ["profileNameSurname", "profileFiscalCode", "profileEmail"]
      : []),
    // if the OS is IOS remove the item related to the gallery prominent disclosure
    ...(isIos ? ["galleryProminentDisclosure"] : [])
  ];
  const items = getItems(itemsProps)
    .filter(it => (!assistanceForPayment ? it.id !== "paymentIssues" : true))
    .filter(it => (!assistanceForCard ? it.id !== "addCardIssues" : true))
    .filter(it => !itemsToRemove.includes(it.id ?? ""))
    // remove these item whose have no value associated
    .filter(it => it.value !== notAvailable);

  const locale = getFullLocale();
  const handleOnCancel = () => {
    handleItemOnPress(
      anonymousAssistanceAddressWithSubject(
        zendeskSelectedCategory.description[locale],
        zendeskSelectedSubcategory?.description[locale]
      ),
      undefined,
      constNull,
      () => {
        showToast(
          I18n.t("support.askPermissions.toast.emailClientNotFound", {
            emailAddress: anonymousAssistanceAddress
          }),
          "warning"
        );
      }
    )();
    void mixpanelTrack("ZENDESK_DENY_PERMISSIONS");
    workUnitCompleted();
  };

  const handleOnContinuePress = () => {
    // Set custom fields
    items.forEach(it => {
      if (it.value !== undefined && it.zendeskId !== undefined) {
        addTicketCustomField(it.zendeskId, it.value);
      }
    });

    // Send the versions history
    addTicketCustomField(
      zendeskVersionsHistoryId,
      arrayToZendeskValue(versionsHistory)
    );

    // Even though the current app version field
    // has been replaced by the versions history,
    // we still send the old app version field for
    // backward compatibility.
    addTicketCustomField(zendeskCurrentAppVersionId, currentVersion);

    // Tag the ticket with the current app version
    addTicketTag(currentVersion);

    openSupportTicket();
    void mixpanelTrack("ZENDESK_OPEN_TICKET");
    workUnitCompleted();
  };
  const cancelButtonProps = {
    testID: "cancelButtonId",
    primary: false,
    bordered: true,
    onPress: handleOnCancel,
    title: I18n.t("support.askPermissions.cta.denies")
  };
  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: handleOnContinuePress,
    title: I18n.t("support.askPermissions.cta.allow")
  };

  return (
    <BaseScreenComponent
      showChat={false}
      goBack={true}
      headerTitle={I18n.t("support.askPermissions.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskAskPermissions"}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <H1>{I18n.t("support.askPermissions.title")}</H1>
            <VSpacer size={16} />
            <H4 weight={"Regular"}>{I18n.t("support.askPermissions.body")}</H4>
            <VSpacer size={4} />
            <Link
              onPress={() => {
                openWebUrl(zendeskPrivacyUrl, () =>
                  showToast(I18n.t("global.jserror.title"))
                );
              }}
            >
              {I18n.t("support.askPermissions.privacyLink")}
            </Link>
            <VSpacer size={8} />
            <H3>{I18n.t("support.askPermissions.listHeader")}</H3>

            {items.map((item, idx) => (
              <ZendeskItemPermissionComponent
                key={`permission_item_${idx}`}
                {...item}
              />
            ))}
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskAskPermissions;
