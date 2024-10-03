import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {GraphQLError} from "graphql/error";

export abstract class DB {
  abstract get(tableName: string, fields: string[]): Promise<{}>;
  abstract update(tableName: string, fields: string[]): Promise<boolean>;
  abstract post(tableName: string, fields: string[]): Promise<boolean>;
  abstract delete(tableName: string, id: string): Promise<boolean>;
  abstract customQuery(query: string): Promise<{}>;
}
