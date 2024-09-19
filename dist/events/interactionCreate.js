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
    name: discord_js_1.Events.InteractionCreate,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.customId === 'scrimmodal') {
                const teamName = interaction.fields.getTextInputValue('teamname');
                const captain = interaction.fields.getTextInputValue('captain');
                const player2 = interaction.fields.getTextInputValue('player2');
                const player3 = interaction.fields.getTextInputValue('player3');
                const captainId = yield findUserIdByUsername(captain, interaction);
                const player2Id = yield findUserIdByUsername(player2, interaction);
                const player3Id = yield findUserIdByUsername(player3, interaction);
                yield interaction.reply(`${teamName} <@${captainId}> <@${player2Id}> <@${player3Id}>`);
                return;
            }
            if (!interaction.isChatInputCommand())
                return;
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                yield command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    yield interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                }
                else {
                    yield interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        });
    },
};
function findUserIdByUsername(username, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const guild = interaction.client.guilds.cache.first(); // Get the first guild the bot is in
            if (!guild)
                return null;
            const member = yield guild.members.fetch({ query: username, limit: 1 });
            if (member.size === 0)
                return null;
            return member.first().user.id;
        }
        catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    });
}
