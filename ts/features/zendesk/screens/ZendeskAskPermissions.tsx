import {
  ContentWrapper,
  Divider,
  IOButton,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { ComponentProps, useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { zendeskPrivacyUrl } from "../../../config";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { mixpanelTrack } from "../../../mixpanel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  idpSelector,
  zendeskTokenSelector
} from "../../authentication/common/store/selectors";
import { appVersionHistorySelector } from "../../../store/reducers/installation";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../settings/common/store/selectors";
import { getAppVersion } from "../../../utils/appVersion";
import {
  getFreeDiskStorage,
  getModel,
  getSystemVersion
} from "../../../utils/device";
import { getFullLocale } from "../../../utils/locale";
import { isIos } from "../../../utils/platform";
import { formatBytesWithUnit } from "../../../utils/strings";
import {
  addTicketCustomField,
  addTicketTag,
  anonymousAssistanceAddress,
  anonymousAssistanceAddressWithSubject,
  getZendeskConfig,
  getZendeskIdentity,
  initSupportAssistance,
  openSupportTicket,
  setUserIdentity,
  zendeskCurrentAppVersionId,
  zendeskDeviceAndOSId,
  zendeskidentityProviderId,
  zendeskVersionsHistoryId
} from "../../../utils/supportAssistance";
import { handleItemOnPress, openWebUrl } from "../../../utils/url";
import { ZendeskParamsList } from "../navigation/params";
import ZENDESK_ROUTES from "../navigation/routes";
import {
  type ZendeskAssistanceType,
  zendeskStopPolling,
  zendeskSupportCompleted,
  zendeskSupportFailure
} from "../store/actions";
import {
  getZendeskTokenStatusSelector,
  zendeskSelectedCategorySelector,
  zendeskSelectedSubcategorySelector,
  ZendeskTokenStatusEnum
} from "../store/reducers";
import { isLoggedIn } from "../../authentication/common/store/utils/guards";

/**
 * Transform an array of string into a Zendesk
 * value to display.
 */
const arrayToZendeskValue = (arr: Array<string>) => arr.join(", ");

export type ItemPermissionProps = Pick<
  ComponentProps<typeof ListItemInfo>,
  "testID" | "label" | "value" | "icon"
> & {
  id?: string;
  zendeskID?: string;
};

export type ZendeskAskPermissionsNavigationParams = {
  assistanceType: ZendeskAssistanceType;
};

/**
 * this screen shows the kinds of data the app could collect when a user is asking for assistance
 * @constructor
 */
const ZendeskAskPermissions = () => {
  const route =
    useRoute<RouteProp<ZendeskParamsList, "ZENDESK_ASK_PERMISSIONS">>();

  const { assistanceType } = route.params;

  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());
  const dispatchZendeskUiDismissed = useCallback(
    () => dispatch(zendeskStopPolling()),
    [dispatch]
  );
  const notAvailable = I18n.t("global.remoteStates.notAvailable");
  const isUserLoggedIn = useIOSelector(s => isLoggedIn(s.authentication));
  const identityProvider = pipe(
    useIOSelector(idpSelector, _.isEqual),
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
  // the zendeskToken could be undefined also if you are logged-in
  // because the retrieval of the zendeskToken is in progress
  const zendeskToken = useIOSelector(zendeskTokenSelector);
  const getZendeskTokenStatus = useIOSelector(getZendeskTokenStatusSelector);

  useEffect(() => {
    // This check is added because there may be a getSession running
    // that retrieves the zendeskToken and consequently the zendeskToken
    // may be undefined even though the user is logged in
    if (getZendeskTokenStatus !== ZendeskTokenStatusEnum.REQUEST) {
      const zendeskConfig = getZendeskConfig(zendeskToken);
      initSupportAssistance(zendeskConfig);

      // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
      // The AnonymousConfig is used for the anonymous user.
      // Since the zendesk session token and the profile are provided by two different endpoint
      // we sequentially check both:
      // - if the zendeskToken is present the user will be authenticated via jwt
      // - nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
      const zendeskIdentity = getZendeskIdentity(zendeskToken);
      setUserIdentity(zendeskIdentity);
    }
  }, [dispatch, getZendeskTokenStatus, zendeskToken]);

  const currentVersion = getAppVersion();

  const permissionItems: ReadonlyArray<ItemPermissionProps> = [
    {
      id: "profileNameSurname",
      icon: "profile",
      label: I18n.t("support.askPermissions.nameSurname"),
      value: nameSurname,
      testID: "profileNameSurname"
    },
    {
      id: "profileFiscalCode",
      icon: "fiscalCodeIndividual",
      label: I18n.t("support.askPermissions.fiscalCode"),
      value: fiscalCode,
      testID: "profileFiscalCode"
    },
    {
      id: "profileEmail",
      icon: "email",
      label: I18n.t("support.askPermissions.emailAddress"),
      value: email,
      testID: "profileEmail"
    },
    {
      id: "galleryProminentDisclosure",
      icon: "gallery",
      label: I18n.t("support.askPermissions.prominentDisclosure"),
      value: I18n.t("support.askPermissions.prominentDisclosureData"),
      testID: "galleryProminentDisclosure"
    },
    {
      id: "paymentIssues",
      icon: "docGiacenza",
      label: I18n.t("support.askPermissions.stock"),
      value: I18n.t("support.askPermissions.stockValue"),
      testID: "paymentIssues"
    },
    {
      id: "addCardIssues",
      icon: "creditCard",
      label: I18n.t("support.askPermissions.card"),
      value: I18n.t("support.askPermissions.cardValue"),
      testID: "addCardIssues"
    },
    {
      id: "addFciIssues",
      icon: "docGiacenza",
      label: I18n.t("support.askPermissions.fci"),
      value: I18n.t("support.askPermissions.fciValue"),
      testID: "addFciIssues"
    },
    {
      icon: "device",
      label: I18n.t("support.askPermissions.deviceAndOS"),
      value: `${getModel()} · ${
        isIos ? "iOS" : "Android"
      } ${getSystemVersion()}`,
      zendeskID: zendeskDeviceAndOSId,
      testID: "deviceAndOS"
    },
    {
      icon: "battery",
      label: I18n.t("support.askPermissions.devicePerformance"),
      value: Platform.select({
        ios: I18n.t("support.askPermissions.devicePerformanceDataiOS", {
          storage: formatBytesWithUnit(getFreeDiskStorage())
        }),
        android: I18n.t("support.askPermissions.devicePerformanceDataAndroid")
      }),
      testID: "devicePerformance"
    },
    {
      icon: "website",
      label: I18n.t("support.askPermissions.ipAddress"),
      value: I18n.t("support.askPermissions.ipAddressValue"),
      testID: "ipAddress"
    },
    {
      icon: "info",
      label: I18n.t("support.askPermissions.appVersionsHistory"),
      value: I18n.t("support.askPermissions.appVersionsHistoryValue"),
      testID: "appVersionsHistory"
    },
    {
      icon: "login",
      label: I18n.t("support.askPermissions.identityProvider"),
      value: identityProvider,
      zendeskID: zendeskidentityProviderId,
      testID: "identityProvider"
    },
    {
      icon: "history",
      label: I18n.t("support.askPermissions.navigationData"),
      value: I18n.t("support.askPermissions.navigationDataValue"),
      testID: "navigationData"
    }
  ];

  const showHeader =
    getZendeskTokenStatus !== ZendeskTokenStatusEnum.REQUEST &&
    getZendeskTokenStatus !== ZendeskTokenStatusEnum.ERROR;

  useHeaderSecondLevel({
    title: "",
    canGoBack: showHeader,
    headerShown: showHeader
  });

  // It should never happens since it is selected in the previous screen
  if (zendeskSelectedCategory === undefined) {
    dispatch(zendeskSupportFailure("The category has not been selected"));
    return null;
  }

  const itemsToRemove: ReadonlyArray<string> = [
    // if user is not asking assistance for a payment, remove the related items from those ones shown
    ...(!assistanceType.payment ? ["paymentIssues"] : []),
    // if user is not asking assistance for a payment, remove the related items from those ones shown
    ...(!assistanceType.card ? ["addCardIssues"] : []),
    // if user is not asking assistance for a signing flow, remove the related items from those ones shown
    ...(!assistanceType.fci ? ["addFciIssues"] : []),
    // if user is not logged in, remove the items related to his/her profile
    ...(!isUserLoggedIn
      ? ["profileNameSurname", "profileFiscalCode", "profileEmail"]
      : []),
    // if the OS is IOS remove the item related to the gallery prominent disclosure
    ...(isIos ? ["galleryProminentDisclosure"] : [])
  ];

  const items = permissionItems
    .filter(it => (!assistanceType.payment ? it.id !== "paymentIssues" : true))
    .filter(it => (!assistanceType.card ? it.id !== "addCardIssues" : true))
    .filter(it => (!assistanceType.fci ? it.id !== "addFciIssues" : true))
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
        IOToast.warning(
          I18n.t("support.askPermissions.toast.emailClientNotFound", {
            emailAddress: anonymousAssistanceAddress
          })
        );
      }
    )();
    void mixpanelTrack("ZENDESK_DENY_PERMISSIONS");
    workUnitCompleted();
  };

  const handleOnContinuePress = () => {
    // Set custom fields
    items.forEach(it => {
      if (it.value !== undefined && it.zendeskID !== undefined) {
        addTicketCustomField(it.zendeskID, it.value as string);
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

    openSupportTicket(() => dispatchZendeskUiDismissed());
    void mixpanelTrack("ZENDESK_OPEN_TICKET");
    workUnitCompleted();
  };

  const buttonConf: ComponentProps<
    typeof IOScrollViewWithLargeHeader
  >["actions"] = {
    type: "TwoButtons",
    primary: {
      label: I18n.t("support.askPermissions.cta.allow"),
      testID: "continueButtonId",
      onPress: handleOnContinuePress
    },
    secondary: {
      label: I18n.t("support.askPermissions.cta.denies"),
      testID: "cancelButtonId",
      onPress: handleOnCancel
    }
  };

  const renderPermissionItem = ({
    item
  }: ListRenderItemInfo<ItemPermissionProps>) => (
    <ListItemInfo
      testID={item?.testID}
      label={item?.label}
      value={item?.value}
      icon={item?.icon}
    />
  );

  if (
    getZendeskTokenStatus === ZendeskTokenStatusEnum.REQUEST &&
    isUserLoggedIn
  ) {
    return <LoadingSpinnerOverlay isLoading />;
  }

  if (
    getZendeskTokenStatus === ZendeskTokenStatusEnum.ERROR &&
    isUserLoggedIn
  ) {
    navigation.navigate(ZENDESK_ROUTES.MAIN, {
      screen: ZENDESK_ROUTES.ERROR_REQUEST_ZENDESK_TOKEN
    });
    return undefined;
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("support.askPermissions.title"),
        section: I18n.t("support.askPermissions.header")
      }}
      testID={"ZendeskAskPermissions"}
      description={I18n.t("support.askPermissions.body")}
      ignoreSafeAreaMargin={true}
      actions={buttonConf}
    >
      <ContentWrapper>
        <IOButton
          variant="link"
          accessibilityRole="link"
          label={I18n.t("support.askPermissions.privacyLink")}
          onPress={() => {
            openWebUrl(zendeskPrivacyUrl, () =>
              IOToast.error(I18n.t("global.jserror.title"))
            );
          }}
        />
      </ContentWrapper>

      <VSpacer size={16} />

      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        ListHeaderComponent={
          <ListItemHeader label={I18n.t("support.askPermissions.listHeader")} />
        }
        data={items}
        keyExtractor={(item, idx) => `permission_item_${item}_${idx}`}
        renderItem={renderPermissionItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default ZendeskAskPermissions;
