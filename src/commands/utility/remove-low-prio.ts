import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import lowPrioUsers from '../../models/lowPrioUsers';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removelowprio')
        .setDescription('Removes a user from the low priority list')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove from low priority list')
                .setRequired(true)),

    async execute(interaction: any) {
        const user = interaction.options.getUser('user');
        lowPrioUsers.delete(user.id);
        await interaction.reply(`User ${user.username} has been removed from the low priority list.`);
    }
};