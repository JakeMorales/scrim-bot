import {DB, JSONValue} from "./db";
import configJson from '../../config.json';
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {GraphQLError} from "graphql/error";
const config: { nhost: {adminSecret: string, subdomain: string, region: string }} = configJson;

class NhostDb extends DB {
  private nhostClient: NhostClient;
  // TODO cache values?

  constructor(adminSecret: string, region: string, subdomain: string) {
    super();
    this.nhostClient = new NhostClient({
      autoLogin: false,
      subdomain,
      region,
      adminSecret,
    })
  }

  // TODO generate more complicated search queryies, not just _and { _eq }
  private static generateSearchStringFromFields(fields: Record<string, string> | undefined): string {
    if (!fields) {
      return ''
    }
    const searchStringArray = Object.keys(fields).map((fieldKey) => `{ ${fieldKey}: { _eq: "${fields[fieldKey]}" } }`);
    return `(where: { _and: [${searchStringArray.join(", ")}]})`
  }

  async get(tableName: string, fieldsToSearch: Record<string, string> | undefined, fieldsToReturn: string[]): Promise<JSONValue> {
    const searchString = NhostDb.generateSearchStringFromFields(fieldsToSearch);
    const query = `
      query {
        ${tableName}${searchString} {
          ${fieldsToReturn.join('\n          ')}
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    return result.data;
  }

  async post(tableName: string, data: Record<string, string>): Promise<string> {
    const insertName = "insert_" + tableName;
    const objectsString = `(objects: [{ ${Object.keys(data).map((key) => `${key}: "${data[key]}"`)} }])`
    const query = `
      mutation {
        ${insertName}${objectsString} {
          returning {
            id
          }
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    const returnedData: Record<string, { returning: { id: string}[] }> = result.data as Record<string, { returning: { id: string}[] }>
    return returnedData[insertName].returning[0].id;
  }

  async delete(tableName: string, id: string): Promise<string> {
    const deleteName = "delete_" + tableName;
    const searchString = NhostDb.generateSearchStringFromFields({ id });
    const query = `
      mutation {
        ${deleteName}${searchString} {
          returning {
            id
          }
        }
      }
    `
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    const returnedData: Record<string, { returning: { id: string}[] }> = result.data as Record<string, { returning: { id: string}[] }>
    return returnedData[deleteName].returning[0].id;
  }

  update(tableName: string, fields: string[]): Promise<boolean> {
    return Promise.resolve(false);
  }

  customQuery(query: string): Promise<JSONValue> {
    return Promise.resolve({});
  }

  async insertPlayerIfNotExists(discordId: string, displayName: string, overstatLink?: string) {
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
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    const returnedData: { insert_players_one: { id: string} } = result.data as { insert_players_one: { id: string} };
    return returnedData.insert_players_one.id;
  }
}
export const nhostDb = new NhostDb(config.nhost.adminSecret, config.nhost.region, config.nhost.subdomain)
