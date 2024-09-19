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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('dropout')
        .setDescription('Drops a team from the signup list')
        .addStringOption(option => option
        .setName('teamname')
        .setDescription('Team name')
        .setMinLength(1)
        .setMaxLength(150)
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = interaction.channelId;
            const teamName = interaction.options.getString('teamname');
            const userId = interaction.user.id;
            if (!signups_1.default.has(channelId)) {
                return interaction.reply(`No signups found for this channel.`);
            }
            const channelSignups = signups_1.default.get(channelId);
            if (!channelSignups) {
                return interaction.reply(`No signups found for this channel.`);
            }
            const { mainList, waitList } = channelSignups;
            const waitlistCutoff = 20;
            // Function to check if the user is a player in the team
            const isUserInTeam = (team) => {
                return team.players.some(player => player.id === userId);
            };
            // Find and remove the team from the main list
            const mainListIndex = mainList.findIndex(team => team.teamName === teamName && isUserInTeam(team));
            if (mainListIndex !== -1) {
                mainList.splice(mainListIndex, 1);
            }
            else {
                // If not found in the main list, find and remove the team from the waitlist
                const waitlistIndex = waitList.findIndex(team => team.teamName === teamName && isUserInTeam(team));
                if (waitlistIndex !== -1) {
                    waitList.splice(waitlistIndex, 1);
                }
                else {
                    return interaction.reply({ content: `Team ${teamName} not found in the signups or you are not a member of this team.`, ephemeral: true });
                }
            }
            // Move the top team from the waitlist to the main list if the main list is below the cutoff
            if (mainList.length < waitlistCutoff && waitList.length > 0) {
                const teamToMove = waitList.shift();
                if (teamToMove) {
                    mainList.push(teamToMove);
                }
            }
            // Update the signups with the modified lists
            signups_1.default.set(channelId, { mainList, waitList });
            yield interaction.reply(`Team ${teamName} has been dropped from the signups.`);
        });
    }
};
