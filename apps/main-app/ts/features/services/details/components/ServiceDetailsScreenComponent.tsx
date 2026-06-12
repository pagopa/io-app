import { ServiceDetailsScreenCdc } from "./ServiceDetailsScreenCdc";
import {
  ServiceDetailsScreenCgn,
  ServiceDetailsScreenCgnProps
} from "./ServiceDetailsScreenCgn";
import {
  ServiceDetailsScreenDefault,
  ServiceDetailsScreenDefaultProps
} from "./ServiceDetailsScreenDefault";
import {
  ServiceDetailsScreenPn,
  ServiceDetailsScreenPnProps
} from "./ServiceDetailsScreenPn";

type ServiceDetailsScreenCgn = {
  kind: "cgn";
} & ServiceDetailsScreenCgnProps;

type ServiceDetailsScreenCdc = {
  kind: "cdc";
} & ServiceDetailsScreenCgnProps;

type ServiceDetailsScreenDefault = {
  kind?: "default";
} & ServiceDetailsScreenDefaultProps;

type ServiceDetailsScreenPn = {
  kind: "pn";
} & ServiceDetailsScreenPnProps;

export type ServiceDetailsScreenComponent =
  | ServiceDetailsScreenCdc
  | ServiceDetailsScreenCgn
  | ServiceDetailsScreenDefault
  | ServiceDetailsScreenPn;

export type ServiceKind = ServiceDetailsScreenComponent["kind"];

/**
 * This component renders different types of service
 * details screens based on the kind
 */
export const ServiceDetailsScreenComponent = ({
  children,
  ...rest
}: ServiceDetailsScreenComponent) => {
  switch (rest.kind) {
    case "cdc":
      return (
        <ServiceDetailsScreenCdc {...rest}>{children}</ServiceDetailsScreenCdc>
      );
    case "cgn":
      return (
        <ServiceDetailsScreenCgn {...rest}>{children}</ServiceDetailsScreenCgn>
      );
    case "pn":
      return (
        <ServiceDetailsScreenPn {...rest}>{children}</ServiceDetailsScreenPn>
      );
    default:
      return (
        <ServiceDetailsScreenDefault {...rest}>
          {children}
        </ServiceDetailsScreenDefault>
      );
  }
};
