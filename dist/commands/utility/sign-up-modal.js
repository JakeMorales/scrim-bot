"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("signupmodal")
        .setDescription("This is the signup modal"),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const modal = new discord_js_1.ModalBuilder()
                .setTitle("Scrim Signup")
                .setCustomId('scrimmodal');
            const teamName = new discord_js_1.TextInputBuilder()
                .setCustomId('teamname')
                .setRequired(true)
                .setLabel("Provide your team name")
                .setStyle(discord_js_1.TextInputStyle.Short);
            const captain = new discord_js_1.TextInputBuilder()
                .setCustomId('captain')
                .setRequired(true)
                .setLabel("Tag your captain")
                .setStyle(discord_js_1.TextInputStyle.Short);
            const player2 = new discord_js_1.TextInputBuilder()
                .setCustomId('player2')
                .setRequired(true)
                .setLabel("Tag your second player")
                .setStyle(discord_js_1.TextInputStyle.Short);
            const player3 = new discord_js_1.TextInputBuilder()
                .setCustomId('player3')
                .setRequired(true)
                .setLabel("Tag your third player")
                .setStyle(discord_js_1.TextInputStyle.Short);
            const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(teamName);
            const secondActionRow = new discord_js_1.ActionRowBuilder().addComponents(captain);
            const thirdActionRow = new discord_js_1.ActionRowBuilder().addComponents(player2);
            const fourthActionRow = new discord_js_1.ActionRowBuilder().addComponents(player3);
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
            interaction.showModal(modal);
        });
    }
};
