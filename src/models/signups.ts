import {Snowflake, User} from "discord.js";
import {Player, PlayerInsert} from "./Player";
import {DB} from "../db/db";
import {nhostDb} from "../db/nhost.db";
import {Scrims, ScrimSignupsWithPlayers} from "../db/table.interfaces";

interface ScrimSignup {
  teamName: string;
  players: Player[];
  signupId: string;
  lowPrio?: number;
}

export class ScrimSignups {
  activeScrimSignups: Map<string, ScrimSignup[]>
  db: DB;

  // maps discord channel id's to scrim id
  scrimChannelMap: Map<string, string>

  constructor(db: DB) {
    this.activeScrimSignups = new Map();
    this.db = db;
    this.scrimChannelMap = new Map()
    this.updateActiveScrims()
  }

  // TODO, do not use get,post etc, wrap the methods in the db class for easy use here
  async updateActiveScrims() {
    const activeScrims: { scrims: Partial<Scrims>[]} = await this.db.getActiveScrims();
    for (const scrim of activeScrims.scrims) {
      if (scrim.id && scrim.discord_channel) {
        this.scrimChannelMap.set(scrim.discord_channel, scrim.id)
        this.getSignups(scrim.id)
      }
    }
  }

  async createScrim(discordChannelID: string, dateTime: Date): Promise<string> {
    const scrimId = await this.db.createNewScrim(dateTime, discordChannelID, 1)
    this.scrimChannelMap.set(discordChannelID, scrimId)
    this.activeScrimSignups.set(scrimId, [])
    return scrimId
  }

  async addTeam(scrimId: string, teamName: string, players: User[]): Promise<string> {
    // potentially need to update active scrim signups here if we ever start creating scrims from something that is not the bot
    const scrim = this.activeScrimSignups.get(scrimId)
    if (!scrim) {
      throw Error("No active scrims with that scrim id")
    } else if (players.length !== 3) {
      throw Error("Exactly three players must be provided")
    }
    const convertedPlayers: PlayerInsert[] = players.map((discordUser: User) => ({ discordId: discordUser.id as string, displayName: discordUser.displayName }))
    const playerIds = await this.db.insertPlayers(convertedPlayers)
    const signupId = await this.db.addScrimSignup(teamName, scrimId, playerIds[0], playerIds[1], playerIds[2])
    const mappedPlayers: Player[] = convertedPlayers.map((player, index) => ({ id: playerIds[index], displayName: player.displayName, discordId: player.discordId, overstatLink: player.overstatLink, elo: player.elo }))
    scrim.push({
      teamName: teamName,
      players: mappedPlayers,
      signupId,
    })
    return signupId;
  }

  // TODO cacheing here?
  async getSignups(scrimId: string): Promise<{ mainList: ScrimSignup[], waitList: ScrimSignup[] }> {
    const scrimData = await this.db.getScrimSignupsWithPlayers(scrimId)
    const teams: ScrimSignup[] = []
    for (const signupData of scrimData) {
      const teamData: ScrimSignup = ScrimSignups.convertDbToScrimSignup(signupData)
      teams.push(teamData)
    }
    // TODO make call for all users who are low prio
    this.activeScrimSignups.set(scrimId, teams)
    return ScrimSignups.sortTeams(teams)
  }

  static sortTeams(teams: ScrimSignup[]): { mainList: ScrimSignup[], waitList: ScrimSignup[] } {
    return { mainList: [], waitList: []}
  }

  static convertDbToScrimSignup(dbTeamData: ScrimSignupsWithPlayers): ScrimSignup {
    return {
      signupId: 'for now we dont get the id',
      teamName: dbTeamData.team_name,
      players: this.convertToPlayers(dbTeamData),
    }
  }

  static convertToPlayers(dbTeamData: ScrimSignupsWithPlayers): Player[] {
    return [
      {
        id: dbTeamData.player_one_id,
        displayName: dbTeamData.player_one_display_name,
        discordId: dbTeamData.player_one_discord_id,
        overstatLink: dbTeamData.player_one_overstat_link,
        elo: dbTeamData.player_one_elo,
      },
      {
        id: dbTeamData.player_two_id,
        displayName: dbTeamData.player_two_display_name,
        discordId: dbTeamData.player_two_discord_id,
        overstatLink: dbTeamData.player_two_overstat_link,
        elo: dbTeamData.player_two_elo,
      },
      {
        id: dbTeamData.player_three_id,
        displayName: dbTeamData.player_three_display_name,
        discordId: dbTeamData.player_three_discord_id,
        overstatLink: dbTeamData.player_three_overstat_link,
        elo: dbTeamData.player_three_elo,
      },
    ]
  }
}

export const signups = new ScrimSignups(nhostDb)
export default signups;
