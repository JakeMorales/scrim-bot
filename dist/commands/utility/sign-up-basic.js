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
const lowPrioUsers_1 = __importDefault(require("../../models/lowPrioUsers"));
const signups_1 = __importDefault(require("../../models/signups"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('signup')
        .setDescription('Creates a new scrim signup')
        .addStringOption(option => option
        .setName('teamname')
        .setDescription('Team name')
        .setMinLength(1)
        .setMaxLength(150)
        .setRequired(true))
        .addUserOption(option => option.setName('player1')
        .setDescription('@player1')
        .setRequired(true))
        .addUserOption(option => option.setName('player2')
        .setDescription('@player2')
        .setRequired(true))
        .addUserOption(option => option.setName('player3')
        .setDescription('@player3')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = interaction.channelId;
            const teamName = interaction.options.getString('teamname');
            const player1 = interaction.options.getUser('player1');
            const player2 = interaction.options.getUser('player2');
            const player3 = interaction.options.getUser('player3');
            if (!signups_1.default.has(channelId)) {
                signups_1.default.set(channelId, { mainList: [], waitList: [] });
            }
            const channelSignups = signups_1.default.get(channelId) || { mainList: [], waitList: [] };
            if (channelSignups) {
                const waitlistCutoff = 3;
                const { mainList, waitList } = channelSignups;
                const newTeam = { teamName, players: [player1, player2, player3] };
                // Check if any player is in the low prio list
                const isLowPrio = newTeam.players.some(player => lowPrioUsers_1.default.has(player.id));
                console.log('Before adding new team:');
                console.log('Main List:', mainList);
                console.log('Waitlist:', waitList);
                if (mainList.length < waitlistCutoff) {
                    mainList.push(newTeam);
                }
                else if (mainList.length >= waitlistCutoff) {
                    waitList.push(newTeam);
                }
                console.log('After adding new team:');
                console.log('Main List:', mainList);
                console.log('Waitlist:', waitList);
                // Ensure the main list does not exceed the cutoff
                while (mainList.length > waitlistCutoff) {
                    const lowPrioTeamIndex = mainList.findIndex(team => team.players.some(player => lowPrioUsers_1.default.has(player.id)));
                    if (lowPrioTeamIndex !== -1) {
                        const lowPrioTeam = mainList.splice(lowPrioTeamIndex, 1)[0];
                        console.log("lowPrioTeam: ", lowPrioTeam);
                        waitList.push(lowPrioTeam);
                    }
                    else {
                        waitList.unshift(mainList.pop());
                    }
                }
                console.log('Waitlist control:');
                console.log('Waitlist:', waitList);
                if (waitList.length > 0) {
                    const nonLowPrioWaitlist = waitList.filter(team => !team.players.some(player => lowPrioUsers_1.default.has(player.id)));
                    const lowPrioWaitlist = waitList.filter(team => team.players.some(player => lowPrioUsers_1.default.has(player.id)));
                    console.log("lowPrioWaitlist: ", lowPrioWaitlist);
                    console.log("nonLowPrioWaitlist: ", nonLowPrioWaitlist);
                    // Update the signups with the adjusted lists
                    if (nonLowPrioWaitlist && lowPrioWaitlist) {
                        // Combine the non-low priority and low priority waitlists
                        const finalWaitlist = nonLowPrioWaitlist.concat(lowPrioWaitlist);
                        console.log("finalWaitlist: ", finalWaitlist);
                        signups_1.default.set(channelId, { mainList, waitList: finalWaitlist });
                    }
                    else if (nonLowPrioWaitlist && !lowPrioWaitlist) {
                        signups_1.default.set(channelId, { mainList, waitList });
                    }
                    // Update the signups with the adjusted lists
                }
                else {
                    signups_1.default.set(channelId, { mainList, waitList });
                }
                yield interaction.reply(`Team ${teamName} signed up with players: ${player1}, ${player2}, ${player3}`);
            }
        });
    }
};
