type E_GO_BACK = {
  type: "GO_BACK";
};

type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  initiativeId?: string;
  initiativeName?: string;
};

type E_CONFIRM_UNSUBSCRIPTION = {
  type: "CONFIRM_UNSUBSCRIPTION";
};

export type Events = E_GO_BACK | E_SELECT_INITIATIVE | E_CONFIRM_UNSUBSCRIPTION;
