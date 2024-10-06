import {DB, JSONValue} from "./db";
import configJson from '../../config.json';
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {GraphQLError} from "graphql/error";
import {Player, PlayerInsert} from "../models/Player";
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

  async post(tableName: string, data: Record<string, string | number | null>): Promise<string> {
    const insertName = "insert_" + tableName;
    // TODO this assumes all values are strings, with "${data[key]}" how to exclude quotations for numeric or null values
    const objectsString = `(objects: [{ ${Object.keys(data).map((key) => this.createGraphObject(key, data[key]))} }])`
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
      console.log(query)
      console.log(result.data)
      console.log(result.error)
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

  async customQuery(query: string): Promise<JSONValue> {
    const result: { data: JSONValue | null; error: GraphQLError[] | ErrorPayload | null } = await this.nhostClient.graphql.request(query)
    if (!result.data || result.error) {
      throw Error("Graph ql error: " + result.error)
    }
    return Promise.resolve(result.data);
  }

  private createGraphObject(key: string, value: string | number | null) {
    if (typeof value === "string") {
      return `${key}: "${value}"`
    }
    else if (value === null) {
      return `${key}: null`
    }
    return `${key}: ${value}`
  }
}
export const nhostDb = new NhostDb(config.nhost.adminSecret, config.nhost.region, config.nhost.subdomain)
