import {DB, JSONValue} from "../../src/db/db";
import {PlayerInsert} from "../../src/models/Player";
import {Scrims, ScrimSignupsWithPlayers} from "../../src/db/table.interfaces";

export class DbMock extends DB {
  customQueryResponse: JSONValue;
  deleteResponse: string;
  getResponse: JSONValue;
  postResponse: string;
  updateResponse: boolean;
  addScrimSignupResponse: string;
  insertPlayersResponse: string[];
  insertPlayerIfNotExistsResponse: string;

  constructor() {
    super();

    this.customQueryResponse = {};
    this.deleteResponse = "";
    this.getResponse = {};
    this.postResponse = "";
    this.updateResponse = true;
    this.addScrimSignupResponse = "";
    this.insertPlayersResponse = [""];
    this.insertPlayerIfNotExistsResponse = "";
  }

  customQuery(query: string): Promise<JSONValue> {
    return Promise.resolve(this.customQueryResponse);
  }

  deleteById(tableName: string, id: string): Promise<string> {
    return Promise.resolve(this.deleteResponse);
  }

  get(tableName: string, fieldsToSearch: Record<string, string>, fieldsToReturn: string[]): Promise<JSONValue> {
    return Promise.resolve(this.getResponse);
  }

  post(tableName: string, data: Record<string, any>): Promise<string> {
    return Promise.resolve(this.postResponse);
  }

  update(tableName: string, fields: string[]): Promise<boolean> {
    return Promise.resolve(this.updateResponse);
  }

  override addScrimSignup(teamName: string, scrimId: string, playerId: string, playerTwoId: string, playerThreeId: string, combinedElo: number | null = null): Promise<string> {
    return Promise.resolve(this.addScrimSignupResponse)
  }

  async insertPlayerIfNotExists(discordId: string, displayName: string, overstatLink?: string): Promise<string> {
    return Promise.resolve(this.insertPlayerIfNotExistsResponse)
  }

  async insertPlayers(players: PlayerInsert[]): Promise<string[]> {
    return Promise.resolve(this.insertPlayersResponse)
  }

  override getActiveScrims(): Promise<{ scrims: Partial<Scrims>[] }> {
      return Promise.resolve({
        "scrims": [
          {
            "id": "ebb385a2-ba18-43b7-b0a3-44f2ff5589b9",
            "discord_channel": "something"
          }
        ]
      })
  }

  override async getScrimSignupsWithPlayers(scrimId: string): Promise<ScrimSignupsWithPlayers[]> {
    return Promise.resolve([]);
  }
}
