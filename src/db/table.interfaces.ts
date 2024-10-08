type uuid = string;

export interface ScrimSignupsWithPlayers {
  scrim_id: uuid;
  date_time: string;
  team_name: string;
  player_one_id: uuid;
  player_one_discord_id: string;
  player_one_display_name: string;
  player_one_overstat_link: string;
  player_one_elo: number;
  player_two_id: uuid;
  player_two_discord_id: string;
  player_two_display_name: string;
  player_two_overstat_link: string;
  player_two_elo: number;
  player_three_id: uuid;
  player_three_discord_id: string;
  player_three_display_name: string;
  player_three_overstat_link: string;
  player_three_elo: number;
}

export interface Scrims {
  id: uuid;
  date_time_field: string;
  skill: number;
  overstat_link?: string;
  discord_channel: string;
  active: boolean;
}
