export interface Player {
  id: string;
  discordId: string;
  displayName: string;
  overstatLink?: string;
  elo?: string;
}

export interface PlayerInsert {
  discordId: string;
  displayName: string;
  overstatLink?: string;
  elo?: string;
}
