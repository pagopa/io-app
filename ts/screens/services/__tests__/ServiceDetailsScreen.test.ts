import { ServiceMetadataState } from "../../../store/reducers/content";
import { canRenderItems } from "../ServiceDetailsScreen";

const serviceA = {
  kind: "PotSome",
  value: {
    description: "test",
    tos_url: "http://www.test.it",
    privacy_url: "http://www.test.it",
    phone: "800 450 900",
    email: "info@test.it",
    scope: "LOCAL"
  }
};

const serviceB = {
  kind: "PotSome",
  value: {
    description: undefined,
    tos_url: "http://www.test.it",
    privacy_url: "http://www.test.it",
    phone: "800 450 900",
    email: "info@test.it",
    scope: "LOCAL"
  }
};

const serviceC = {
  kind: "PotSome",
  value: undefined
};

describe("canRenderItems", () => {
  it("should return true because the markdown is loaded", () => {
    expect(canRenderItems(true, serviceA as ServiceMetadataState)).toEqual(
      true
    );
  });
  it("should return false because the markdown is not loaded", () => {
    expect(canRenderItems(false, serviceA as ServiceMetadataState)).toEqual(
      false
    );
  });
  it("should return true because the services value has content", () => {
    expect(canRenderItems(false, serviceB as ServiceMetadataState)).toEqual(
      true
    );
  });
  it("should return false because the services value is undefined and the markdown is not loaded", () => {
    expect(canRenderItems(false, serviceC as ServiceMetadataState)).toEqual(
      false
    );
  });
});
