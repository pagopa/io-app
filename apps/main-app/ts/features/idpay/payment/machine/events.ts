type AuthorizePayment = {
  readonly type: "authorize-payment";
  readonly trxCode: string;
  readonly data_entry?: "qr_code" | "manual";
};

type Next = {
  readonly type: "next";
};

type Back = {
  readonly type: "back";
};

type Close = {
  readonly type: "close";
};

export type Events = Next | Back | Close | AuthorizePayment;
