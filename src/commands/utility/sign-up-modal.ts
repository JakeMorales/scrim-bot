import { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
    .setName("signupmodal")
    .setDescription("This is the signup modal"),

    async execute(interaction: any){

        const modal = new ModalBuilder()
        .setTitle("Scrim Signup")
        .setCustomId('scrimmodal')

        const teamName = new TextInputBuilder()
        .setCustomId('teamname')
        .setRequired(true)
        .setLabel("Provide your team name")
        .setStyle(TextInputStyle.Short);

        const captain = new TextInputBuilder()
        .setCustomId('captain')
        .setRequired(true)
        .setLabel("Tag your captain")
        .setStyle(TextInputStyle.Short);

        const player2 = new TextInputBuilder()
        .setCustomId('player2')
        .setRequired(true)
        .setLabel("Tag your second player")
        .setStyle(TextInputStyle.Short);

        const player3 = new TextInputBuilder()
        .setCustomId('player3')
        .setRequired(true)
        .setLabel("Tag your third player")
        .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(teamName);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(captain);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(player2);
        const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(player3);



        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
        interaction.showModal(modal);
    }
}