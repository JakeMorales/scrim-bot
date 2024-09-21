import {Snowflake} from "discord.js";

const signups = new Map<Snowflake, { mainList: { teamName: string, players: any[] }[], waitList: { teamName: string, players: any[] }[] }>();

export default signups;
