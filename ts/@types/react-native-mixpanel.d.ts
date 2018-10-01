declare module "react-native-mixpanel" {
  export class MixpanelInstance {
    constructor(apiToken: string);
    initialize(): Promise<void>;
    getDistinctId(): Promise<string>;
    getSuperProperty(propertyName: string): Promise<mixed>;
    track(event: string, properties?: Object): Promise<void>;
    flush(): Promise<void>;
    disableIpAddressGeolocalization(): Promise<void>;
    alias(alias: string): Promise<void>;
    identify(userId: string): Promise<void>;
    timeEvent(event: string): Promise<void>;
    registerSuperProperties(properties: Object): Promise<void>;
    registerSuperPropertiesOnce(properties: Object): Promise<void>;
    set(properties: Object): Promise<void>;
    setOnce(properties: Object): Promise<void>;
    trackCharge(charge: number): Promise<void>;
    trackChargeWithProperties(
      charge: number,
      properties: Object
    ): Promise<void>;
    increment(property: string, by: number): Promise<void>;
    union(name: string, properties: any[]): Promise<void>;
    reset(): Promise<void>;
  }
}
