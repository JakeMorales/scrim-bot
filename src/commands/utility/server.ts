import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Provides information about the server.');

export async function execute(interaction: CommandInteraction): Promise<void> {

    const server = interaction.guild;

    if (server) {
        await interaction.reply(`This server is ${server.name} and has ${server.memberCount} members.`);
    } else {
        await interaction.reply(`I couldn't retrieve information about this server.`);
    }
}