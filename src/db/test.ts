import {ErrorPayload, NhostClient} from '@nhost/nhost-js'
import {GraphQLError} from "graphql/error";

import configJson from '../../config.json';
const config: { nhostAdminSecret: string } = configJson;

const subdomain = 'bsgzgiiagytbnyqsvebl';
const adminSecret = config.nhostAdminSecret;

// Function to fetch data from the scrims table
export async function fetchScrims() {

  const nhost = new NhostClient({
    autoLogin: false,
    subdomain,
    region: 'us-east-1',
    adminSecret,
  })

  const query = `
    query {
      scrims {
        id
        date_field
        overstat_link
        skill
      }
    }
  `

  const result: { data: { scrims: any[] } | null; error: GraphQLError[] | ErrorPayload | null } = await nhost.graphql.request(query)
  console.log("Data", result.data?.scrims)
  console.log("Error", result.error)

  return result.data?.scrims;
}
