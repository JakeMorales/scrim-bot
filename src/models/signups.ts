import {Snowflake, User} from "discord.js";
import {Player, PlayerInsert} from "./Player";
import {DB} from "../db/db";
import {nhostDb} from "../db/nhost.db";

interface ScrimSignup {
  teamName: string;
  players: Player[];
  signupId: string;
  lowPrio?: number;
}

export class Signups {
  activeScrimSignups: Map<string, ScrimSignup[]>
  db: DB;

  constructor(db: DB) {
    this.activeScrimSignups = new Map();
    this.db = db;
  }

  async addTeam(scrimId: string, teamName: string, players: User[]): Promise<string> {
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

  getSignups(): { mainList: ScrimSignup[], waitList: ScrimSignup[] } {
    // make call to db for signups
    // make call for all users who are low prio
    // sort teams into main list and wait list
    // set active
    // return active
    return { mainList: [], waitList: []}
  }

  // currently only uses low prio
  private sortTeams(teams: ScrimSignup[]): { mainList: ScrimSignup[], waitList: ScrimSignup[] } {
    return { mainList: [], waitList: []}
  }
}

export const signups = new Signups(nhostDb)
export default signups;
