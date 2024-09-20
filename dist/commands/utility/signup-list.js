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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const signups_1 = __importDefault(require("../../models/signups"));
const lowPrioUsers_1 = __importDefault(require("../../models/lowPrioUsers"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('signuplist')
        .setDescription('Displays the list of signed up teams for the current channel'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = interaction.channelId;
            if (!signups_1.default.has(channelId)) {
                yield interaction.reply({ content: 'No teams have signed up in this channel yet.', ephemeral: true });
                return;
            }
            const channelSignups = signups_1.default.get(channelId) || { mainList: [], waitList: [] };
            if (!channelSignups) {
                yield interaction.reply({ content: 'No teams have signed up in this channel yet.', ephemeral: true });
                return;
            }
            const { mainList, waitList } = channelSignups;
            const formatTeams = (teams, startIndex) => {
                return teams.map((signup, index) => {
                    const players = signup.players.map(player => `<@${player.id}>`).join(', ');
                    const isLowPrio = signup.players.some(player => lowPrioUsers_1.default.has(player.id));
                    return `${startIndex + index + 1}. ${signup.teamName}: ${players}${isLowPrio ? ' * <-- LOW PRIO' : ''}\n`;
                }).join('');
            };
            const sendMessages = (messages) => __awaiter(this, void 0, void 0, function* () {
                for (const message of messages) {
                    yield interaction.followUp({ content: message, ephemeral: true });
                }
            });
            let messages = [];
            let currentMessage = 'Signed up teams for one lobby:\n';
            const addTeamsToMessages = (teams, startIndex) => {
                for (let i = 0; i < teams.length; i += 20) {
                    const chunk = teams.slice(i, i + 20);
                    currentMessage += formatTeams(chunk, startIndex + i);
                    messages.push(currentMessage);
                    currentMessage = 'Waitlist or multiple lobbies:\n';
                }
            };
            addTeamsToMessages(mainList, 0);
            addTeamsToMessages(waitList, mainList.length);
            yield interaction.reply({ content: messages.shift(), ephemeral: true });
            yield sendMessages(messages);
        });
    }
};
