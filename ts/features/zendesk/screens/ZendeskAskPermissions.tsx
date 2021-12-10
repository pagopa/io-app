import React, { ReactNode } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { constNull } from "fp-ts/lib/function";
import { ListItem, View } from "native-base";
import { useDispatch } from "react-redux";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { navigateToZendeskChooseCategory } from "../store/actions/navigation";
import { H4 } from "../../../components/core/typography/H4";
import { H3 } from "../../../components/core/typography/H3";
import FiscalCodeIcon from "../../../../img/assistance/fiscalCode.svg";
import NameSurnameIcon from "../../../../img/assistance/nameSurname.svg";
import WebSiteIcon from "../../../../img/assistance/website.svg";
import InfoIcon from "../../../../img/assistance/info.svg";
import DeviceIcon from "../../../../img/assistance/telefonia.svg";
import LoginIcon from "../../../../img/assistance/login.svg";
import BugIcon from "../../../../img/assistance/ladybug.svg";
import EmailIcon from "../../../../img/assistance/email.svg";
import { H5 } from "../../../components/core/typography/H5";
import { useIOSelector } from "../../../store/hooks";
import { idpSelector } from "../../../store/reducers/authentication";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector
} from "../../../store/reducers/profile";
import { getModel, getSystemVersion } from "../../../utils/device";
import { isIos } from "../../../utils/platform";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import { getAppVersion } from "../../../utils/appVersion";
import { zendeskSupportCancel } from "../store/actions";

type Item = {
  icon: ReactNode;
  title: string;
  value?: string;
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

// TODO: add payment advice info: https://pagopa.atlassian.net/browse/IA-564
const getItems = (props: ItemProps): ReadonlyArray<Item> => [
  {
    icon: <NameSurnameIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.nameSurname"),
    value: props.nameSurname
  },
  {
    icon: <FiscalCodeIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.fiscalCode"),
    value: props.fiscalCode
  },
  {
    icon: <EmailIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.emailAddress"),
    value: props.email
  },
  {
    icon: <DeviceIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.deviceAndOS"),
    value: props.deviceDescription
  },
  {
    icon: <WebSiteIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.ipAddress")
  },
  {
    icon: <InfoIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.currentAppVersion"),
    value: props.currentVersion
  },
  {
    icon: <LoginIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.identityProvider"),
    value: props.identityProvider
  },
  {
    icon: <BugIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.diagnosticData"),
    value: I18n.t("support.askPermissions.diagnosticDataValue")
  }
];

const ItemComponent = (props: Item) => (
  <ListItem>
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

/**
 * this screen shows the kinds of data the app could collect when a user is asking for assistance
 * @constructor
 */
const ZendeskAskPermissions = () => {
  const navigation = useNavigationContext();
  const dispatch = useDispatch();
  const workUnitCancel = () => dispatch(zendeskSupportCancel());

  const notAvailable = I18n.t("global.remoteStates.notAvailable");
  const identityProvider = useIOSelector(idpSelector)
    .map(idp => idp.name)
    .getOrElse(notAvailable);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector) ?? notAvailable;
  const nameSurname = useIOSelector(profileNameSelector) ?? notAvailable;
  const email = useIOSelector(profileEmailSelector).getOrElse(notAvailable);
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

  const cancelButtonProps = {
    testID: "cancelButtonId",
    primary: false,
    bordered: true,
    onPress: workUnitCancel, // TODO: complete the workunit and send the user to the web form
    title: I18n.t("support.askPermissions.cta.denies")
  };
  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: () => navigation.navigate(navigateToZendeskChooseCategory()), // TODO: if is not possible to get the category open a ticket request
    title: I18n.t("support.askPermissions.cta.allow")
  };
  const items = getItems(itemsProps);
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
            <EdgeBorderComponent />
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
