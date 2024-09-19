import { Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

class ExtendedClient extends Client {
    commands: Collection<string, Command>;

    constructor(options: any) {
        super(options);
        this.commands = new Collection();
    }
}

export default ExtendedClient;