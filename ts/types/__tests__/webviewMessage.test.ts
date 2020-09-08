import * as t from "io-ts";
import { AlertContent, WebviewMessage } from "../WebviewMessage";

const validCloseModal = {
  type: "CLOSE_MODAL"
};

const validStartLoad = {
  type: "START_LOAD"
};

const validEndLoad = {
  type: "END_LOAD"
};

const invalidCloseModal = {
  type: "CLOSE_MODAL",
  en: "prova"
};

const invalidStartLoad = {
  type: "START_LOAD",
  content: "test test"
};

const invalidEndLoad = {
  type: "END_LOAD",
  aaa: "test test"
};

const validShowSuccess1 = {
  type: "SHOW_SUCCESS",
  en: "test",
  it: "test"
};

const validShowSuccess2 = {
  type: "SHOW_SUCCESS",
  en: "test"
};

const invalidShowSuccess1 = {
  type: "SHOW_SUCCESS"
};

const invalidShowSuccess2 = {
  type: "SHOW_SUCCESS",
  en: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowSuccess3 = {
  type: "SHOW_SUCCESS",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowError1 = {
  type: "SHOW_ERROR",
  en: "test",
  it: "test"
};

const validShowError2 = {
  type: "SHOW_ERROR",
  en: "test"
};

const invalidShowError1 = {
  type: "SHOW_ERROR"
};

const invalidShowError2 = {
  type: "SHOW_ERROR",
  en: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowError3 = {
  type: "SHOW_ERROR",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowAlert1 = {
  type: "SHOW_ALERT",
  en: {
    title: "Test title",
    description: "Test description"
  },
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowAlert2 = {
  type: "SHOW_ALERT",
  en: {
    title: "Test title",
    description: "Test description"
  },
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowAlert1 = {
  type: "SHOW_ALERT",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowAlert2 = {
  type: "SHOW_ALERT",
  en: "Test title"
};

const invalidShowAlert3 = {
  type: "SHOW_ALERT"
};

const localeEN = "en";

const localeIT = "it";

describe("WebviewMessage", () => {
  it("Should recognize a valid Message for Close Modal event", () => {
    expect(WebviewMessage.decode(validCloseModal).isRight()).toBeTruthy();
  });

  it("Should recognize a valid Message for Start Load event", () => {
    expect(WebviewMessage.decode(validStartLoad).isRight()).toBeTruthy();
  });

  it("Should recognize a valid Message for End Load event", () => {
    expect(WebviewMessage.decode(validEndLoad).isRight()).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Success event", () => {
    expect(WebviewMessage.decode(validShowSuccess1).isRight()).toBeTruthy();
    expect(t.string.decode(validShowSuccess1[localeEN]).isRight()).toBeTruthy();
    expect(t.string.decode(validShowSuccess1[localeIT]).isRight()).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Success event", () => {
    expect(WebviewMessage.decode(validShowSuccess2).isRight()).toBeTruthy();
    expect(t.string.decode(validShowSuccess2[localeEN]).isRight()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(WebviewMessage.decode(invalidShowSuccess1).isLeft()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(WebviewMessage.decode(invalidShowSuccess2).isLeft()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(WebviewMessage.decode(invalidShowSuccess3).isLeft()).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Error event", () => {
    expect(WebviewMessage.decode(validShowError1).isRight()).toBeTruthy();
    expect(t.string.decode(validShowError1[localeEN]).isRight()).toBeTruthy();
    expect(t.string.decode(validShowError1[localeIT]).isRight()).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Error event", () => {
    expect(WebviewMessage.decode(validShowError2).isRight()).toBeTruthy();
    expect(t.string.decode(validShowError2[localeEN]).isRight()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(WebviewMessage.decode(invalidShowError1).isLeft()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(WebviewMessage.decode(invalidShowError2).isLeft()).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(WebviewMessage.decode(invalidShowError3).isLeft()).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Alert event", () => {
    expect(WebviewMessage.decode(validShowAlert1).isRight()).toBeTruthy();
    expect(
      AlertContent.decode(validShowAlert1[localeEN]).isRight()
    ).toBeTruthy();
    expect(
      AlertContent.decode(validShowAlert1[localeIT]).isRight()
    ).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Alert event", () => {
    expect(WebviewMessage.decode(validShowAlert2).isRight()).toBeTruthy();
    expect(
      AlertContent.decode(validShowAlert1[localeEN]).isRight()
    ).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(WebviewMessage.decode(invalidShowAlert1).isRight()).toBeFalsy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(WebviewMessage.decode(invalidShowAlert2).isRight()).toBeFalsy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(WebviewMessage.decode(invalidShowAlert3).isRight()).toBeFalsy();
  });
});
