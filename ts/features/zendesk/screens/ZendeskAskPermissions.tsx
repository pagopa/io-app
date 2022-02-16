import { constNull } from "fp-ts/lib/function";
import { ListItem, View } from "native-base";
import React, { ReactNode } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { useDispatch } from "react-redux";
import BatteryIcon from "../../../../img/assistance/battery.svg";
import EmailIcon from "../../../../img/assistance/email.svg";
import FiscalCodeIcon from "../../../../img/assistance/fiscalCode.svg";
import GalleryIcon from "../../../../img/assistance/gallery.svg";
import StockIcon from "../../../../img/assistance/giacenza.svg";
import HistoryIcon from "../../../../img/assistance/history.svg";
import InfoIcon from "../../../../img/assistance/info.svg";
import LoginIcon from "../../../../img/assistance/login.svg";
import NameSurnameIcon from "../../../../img/assistance/nameSurname.svg";
import DeviceIcon from "../../../../img/assistance/telefonia.svg";
import WebSiteIcon from "../../../../img/assistance/website.svg";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { useIOSelector } from "../../../store/hooks";
import {
  idpSelector,
  isLoggedIn
} from "../../../store/reducers/authentication";
import { appVersionHistorySelector } from "../../../store/reducers/installation";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { getAppVersion } from "../../../utils/appVersion";
import { getModel, getSystemVersion } from "../../../utils/device";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { isIos } from "../../../utils/platform";
import {
  addTicketCustomField,
  addTicketTag,
  openSupportTicket,
  zendeskCurrentAppVersionId,
  zendeskDeviceAndOSId,
  zendeskidentityProviderId,
  zendeskVersionsHistoryId
} from "../../../utils/supportAssistance";
import { openWebUrl } from "../../../utils/url";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
import { zendeskSupportCompleted } from "../store/actions";
import { navigateToZendeskChooseCategory } from "../store/actions/navigation";
import { zendeskConfigSelector } from "../store/reducers";

/**
 * Transform an array of string into a Zendesk
 * value to display.
 */
const arrayToZendeskValue = (arr: Array<string>) => arr.join(", ");

/**
 * id is optional since some items should recognized since they can be removed from the whole list
 * i.e: items about profile || payment
 */
type Item = {
  id?: string;
  icon: ReactNode;
  title: string;
  value?: string;
  zendeskId?: string;
  testId: string;
};

type ItemProps = {
  fiscalCode: string;
  nameSurname: string;
  email: string;
  deviceDescription: string;
  currentVersion: string;
  identityProvider: string;
};

const iconProps = { width: 24, height: 24 };

const getItems = (props: ItemProps): ReadonlyArray<Item> => [
  {
    id: "profileNameSurname",
    icon: <NameSurnameIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.nameSurname"),
    value: props.nameSurname,
    testId: "profileNameSurname"
  },
  {
    id: "profileFiscalCode",
    icon: <FiscalCodeIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.fiscalCode"),
    value: props.fiscalCode,
    testId: "profileFiscalCode"
  },
  {
    id: "profileEmail",
    icon: <EmailIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.emailAddress"),
    value: props.email,
    testId: "profileEmail"
  },
  {
    id: "galleryProminentDisclosure",
    icon: <GalleryIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.prominentDisclosure"),
    value: I18n.t("support.askPermissions.prominentDisclosureData"),
    testId: "galleryProminentDisclosure"
  },
  {
    id: "paymentIssues",
    icon: <StockIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.stock"),
    value: I18n.t("support.askPermissions.stockValue"),
    testId: "paymentIssues"
  },
  {
    icon: <DeviceIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.deviceAndOS"),
    value: props.deviceDescription,
    zendeskId: zendeskDeviceAndOSId,
    testId: "deviceAndOS"
  },
  {
    icon: <BatteryIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.devicePerformance"),
    value: I18n.t("support.askPermissions.devicePerformanceData"),
    testId: "devicePerformance"
  },
  {
    icon: <WebSiteIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.ipAddress"),
    testId: "ipAddress"
  },
  {
    icon: <InfoIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.currentAppVersion"),
    value: props.currentVersion,
    zendeskId: zendeskCurrentAppVersionId,
    testId: "appVersion"
  },
  {
    icon: <LoginIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.identityProvider"),
    value: props.identityProvider,
    zendeskId: zendeskidentityProviderId,
    testId: "identityProvider"
  },
  {
    icon: <HistoryIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.navigationData"),
    value: I18n.t("support.askPermissions.navigationDataValue"),
    testId: "navigationData"
  }
];

const ItemComponent = (props: Item) => (
  <ListItem testID={props.testId}>
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <View>{props.icon}</View>
      <View hspacer />
      <View style={{ flex: 1, flexDirection: "column" }}>
        <H4>{props.title}</H4>
        {props.value && <H5 weight={"Regular"}>{props.value}</H5>}
      </View>
    </View>
  </ListItem>
);

export type ZendeskAskPermissionsNavigationParams = {
  assistanceForPayment: boolean;
};

type Props = NavigationStackScreenProps<ZendeskAskPermissionsNavigationParams>;
/**
 * this screen shows the kinds of data the app could collect when a user is asking for assistance
 * @constructor
 */
const ZendeskAskPermissions = (props: Props) => {
  const assistanceForPayment = props.navigation.getParam(
    "assistanceForPayment"
  );

  const navigation = useNavigationContext();
  const dispatch = useDispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());
  const zendeskConfig = useIOSelector(zendeskConfigSelector);
  const notAvailable = I18n.t("global.remoteStates.notAvailable");
  const isUserLoggedIn = useIOSelector(s => isLoggedIn(s.authentication));
  const identityProvider = useIOSelector(idpSelector)
    .map(idp => idp.name)
    .getOrElse(notAvailable);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector) ?? notAvailable;
  const nameSurname = useIOSelector(profileNameSurnameSelector) ?? notAvailable;
  const email = useIOSelector(profileEmailSelector).getOrElse(notAvailable);
  const versionsHistory = useIOSelector(appVersionHistorySelector);

  const itemsProps: ItemProps = {
    fiscalCode,
    nameSurname,
    email,
    deviceDescription: `${getModel()} · ${
      isIos ? "iOS" : "Android"
    } · ${getSystemVersion()}`,
    currentVersion: getAppVersion(),
    identityProvider
  };

  const assistanceWebFormLink =
    "https://io.assistenza.pagopa.it/hc/it-it/requests/new";

  const itemsToRemove: ReadonlyArray<string> = [
    // if user is not asking assistance for a payment, remove the related items from those ones shown
    ...(!assistanceForPayment ? ["paymentIssues"] : []),
    // if user is not logged in, remove the items related to his/her profile
    ...(!isUserLoggedIn
      ? ["profileNameSurname", "profileFiscalCode", "profileEmail"]
      : []),
    // if the OS is IOS remove the item related to the gallery prominent disclosure
    ...(isIos ? ["galleryProminentDisclosure"] : [])
  ];
  const items = getItems(itemsProps)
    .filter(it => (!assistanceForPayment ? it.id !== "paymentIssues" : true))
    .filter(it => !itemsToRemove.includes(it.id ?? ""))
    // remove these item whose have no value associated
    .filter(it => it.value !== notAvailable);

  const handleOnCancel = () => {
    openWebUrl(assistanceWebFormLink);
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

    // Tag the ticket with the current app version
    addTicketTag(itemsProps.currentVersion);

    // Add the versions history to the relative Zendesk field
    addTicketCustomField(
      zendeskVersionsHistoryId,
      arrayToZendeskValue(versionsHistory)
    );

    const canSkipCategoryChoice = (): boolean =>
      !isReady(zendeskConfig) ||
      Object.keys(zendeskConfig.value.zendeskCategories?.categories ?? {})
        .length === 0 ||
      assistanceForPayment;

    // if is not possible to get the config, if the config has any category or if is an assistanceForPayment request open directly a ticket.
    if (canSkipCategoryChoice()) {
      openSupportTicket();
      void mixpanelTrack("ZENDESK_OPEN_TICKET");
      workUnitCompleted();
    } else {
      navigation.navigate(navigateToZendeskChooseCategory());
    }
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
      showInstabugChat={false}
      goBack={true}
      // customRightIcon is needed to have a centered header title
      customRightIcon={{
        iconName: "",
        onPress: constNull
      }}
      headerTitle={I18n.t("support.askPermissions.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskAskPermissions"}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <H1>{I18n.t("support.askPermissions.title")}</H1>
            <View spacer />
            <H4 weight={"Regular"}>{I18n.t("support.askPermissions.body")}</H4>
            <View spacer small={true} />
            <H3>{I18n.t("support.askPermissions.listHeader")}</H3>

            {items.map((item, idx) => (
              <ItemComponent key={`permission_item_${idx}`} {...item} />
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
