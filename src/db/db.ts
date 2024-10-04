import {PlayerInsert} from "../models/Player";

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export abstract class DB {
  abstract get(tableName: string, fieldsToSearch: Record<string, string>, fieldsToReturn: string[]): Promise<JSONValue>;
  abstract update(tableName: string, fields: string[]): Promise<boolean>;
  // returns id of new object as a string
  abstract post(tableName: string, data: Record<string, any>): Promise<string>;
  // returns id of the deleted object as a string
  abstract delete(tableName: string, id: string): Promise<string>;
  abstract customQuery(query: string): Promise<JSONValue>;

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
