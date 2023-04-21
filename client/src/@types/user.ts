type BasicUser = {
  accountType: number;
  displayName: string;
  authCategory?: number;
};

export type NewUser = BasicUser & {
  openId: string;
};

export type User = BasicUser & {
  id: number;
  accountTypes?: {
    name: string;
  };
  approved: boolean;
  trainee?: {
    callsign?: string;
  }
};
