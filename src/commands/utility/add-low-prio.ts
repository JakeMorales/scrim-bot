import { SlashCommandBuilder } from 'discord.js';
import lowPrioUsers from '../../models/lowPrioUsers';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addlowprio')
        .setDescription('Adds a user to the low priority list')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add to low priority list')
                .setRequired(true)),

    async execute(interaction: any) {
        const user = interaction.options.getUser('user');
        lowPrioUsers.add(user.id);
        await interaction.reply(`User ${user.username} has been added to the low priority list.`);
    }
};