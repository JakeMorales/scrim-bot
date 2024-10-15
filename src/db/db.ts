import {PlayerInsert} from "../models/Player";
import {Scrims, ScrimSignupsWithPlayers} from "./table.interfaces";

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type DbValue = string | number | boolean | null

export interface JSONArray extends Array<JSONValue> { }

export abstract class DB {
  abstract get(tableName: string, fieldsToSearch: Record<string, DbValue>, fieldsToReturn: string[]): Promise<JSONValue>;
  abstract update(tableName: string, fieldsToEquate: Record<string, DbValue>, fieldsToUpdate: Record<string, DbValue>, fieldsToReturn: string[]): Promise<JSONValue>;
  // returns id of new object as a string
  abstract post(tableName: string, data: Record<string, DbValue>): Promise<string>;
  // returns id of the deleted object as a string
  abstract deleteById(tableName: string, id: string): Promise<string>;
  abstract delete(tableName: string, fieldsToEqual: Record<string, DbValue>): Promise<string>;
  abstract customQuery(query: string): Promise<JSONValue>;
  abstract replaceTeammate(scrimId: string, teamName: string, oldPlayerId: string, newPlayerId: string): Promise<JSONValue>

  createNewScrim(dateTime: Date, discordChannelID: string, skill: number, overstatLink: string | null = null): Promise<string> {
    return this.post("scrims", {
      date_time_field: dateTime.toISOString(),
      skill,
      overstat_link: overstatLink,
      discord_channel: discordChannelID,
    })
  }

  addScrimSignup(teamName: string, scrimId: string, playerId: string, playerTwoId: string, playerThreeId: string, combinedElo: number | null = null): Promise<string> {
    return this.post("scrim_signups", {
      team_name: teamName,
      scrim_id: scrimId,
      player_one_id: playerId,
      player_two_id: playerTwoId,
      player_three_id: playerThreeId,
      combined_elo: combinedElo
    })
  }

  removeScrimSignup(teamName: string, scrimId: string) {
    return this.delete("scrim_signups", {
      scrim_id: scrimId,
      team_name: teamName,
    });
  }
  // returns id
  async insertPlayerIfNotExists(discordId: string, displayName: string, overstatLink?: string): Promise<string> {
    const overstatLinkObjectSuffix = overstatLink ? `, overstat_link: "${overstatLink}"` : ''
    const overstatLinkColumn = overstatLink ? `\n              overstat_link` : ''
    const query = `
      mutation upsertPlayer {
        insert_players_one(
          object: {discord_id: "${discordId}", display_name: "${displayName}"${overstatLinkObjectSuffix}}
          on_conflict: {
            constraint: players_discord_id_key,  # Unique constraint on discord_id
            update_columns: [
              display_name${overstatLinkColumn}
            ]
          }
        ) {
          id  # Return the ID of the player, whether newly inserted or found
        }
      }
    `
    const result: JSONValue = await this.customQuery(query);
    const returnedData: { insert_players_one: { id: string} } = result as { insert_players_one: { id: string} };
    return returnedData.insert_players_one.id;
  }

  /* returns list of id's
   *
   * Created a special method that inserts players if they do not exist, also takes special care not to overwrite overstats and elo if they are in DB but not included in player object
   */
  async insertPlayers(players: PlayerInsert[]): Promise<string[]> {
    const playerUpdates = players.map((player, index) => this.generatePlayerUpdateQuery(player, (index + 1).toString())).join("\n\n")
    const playerInsert = `
      insert_players(objects: [
        ${players.map((player) => `{discord_id: "${player.discordId}", display_name: "${player.displayName}"}`).join('\n')}
      ]
        on_conflict: {
          constraint: players_discord_id_key,   # Unique constraint on discord_id
          update_columns: [
            display_name  # necessary for graphql to actually return an id
          ]
        }
      ) {
        returning {
          id
        }
      }
    `
    const query = `
      mutation upsertPlayer {
        ${playerInsert}

        ${playerUpdates}
      }
    `
    const result: JSONValue = await this.customQuery(query);
    const returnedData: { insert_players: { returning: { id: string}[] }} = result as { insert_players: { returning: { id: string}[] }};
    return returnedData.insert_players.returning.map((entry) => entry.id);
  }

  getActiveScrims(): Promise<{ scrims: Partial<Scrims>[]}> {
    return this.get('scrims', {"active": true}, ["discord_channel", "id"]) as Promise<{ scrims: Partial<Scrims>[]}>;
  }

  async getScrimSignupsWithPlayers(scrimId: string): Promise<ScrimSignupsWithPlayers[]> {
    const query = `
      query GetScrimSignupsWithPlayers {
        get_scrim_signups_with_players(args: { scrim_id_search: "${scrimId}" }) {
          scrim_id
          date_time
          team_name
          player_one_id
          player_one_discord_id
          player_one_display_name
          player_one_overstat_link
          player_one_elo
          player_two_id
          player_two_discord_id
          player_two_display_name
          player_two_overstat_link
          player_two_elo
          player_three_id
          player_three_discord_id
          player_three_display_name
          player_three_overstat_link
          player_three_elo
        }
      }
    `

    const result: JSONValue = await this.customQuery(query);
    const returnedData: {
      get_scrim_signups_with_players: ScrimSignupsWithPlayers[]
    } = result as unknown as { get_scrim_signups_with_players: ScrimSignupsWithPlayers[]};
    return returnedData.get_scrim_signups_with_players;
  }

  changeTeamName(scrimId: string, oldTeamName: string, newTeamName: string): Promise<JSONValue> {
    return this.update('scrim_signups', {scrim_id: "ebb385a2-ba18-43b7-b0a3-44f2ff5589b9", team_name: "Fineapples"}, {team_name: "Dude Cube"}, ["team_name", "player_one_id", "player_two_id", "player_three_id", "scrim_id",])
  }

  private generatePlayerUpdateQuery(player: PlayerInsert, uniqueQueryName: string) {
    const overstatSet = player.overstatLink ? `overstat_link: "${player.overstatLink}"` : '';
    const eloSet = player.elo ? `elo: ${player.elo}` : '';
    return `
      update_player_${uniqueQueryName}: update_players(
         where: {discord_id: {_eq: "${player.discordId}"}},
          _set: {
            display_name: "${player.displayName}",
            ${overstatSet}${overstatSet && eloSet ? "," : ""}
            ${eloSet}
          }
        ) {
          affected_rows
        }
    `
  }
}
