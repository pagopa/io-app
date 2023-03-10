type E_GO_BACK = {
  type: "GO_BACK";
};

type E_CONFIRM_UNSUBSCRIPTION = {
  type: "CONFIRM_UNSUBSCRIPTION";
};

export type Events = E_GO_BACK | E_CONFIRM_UNSUBSCRIPTION;
