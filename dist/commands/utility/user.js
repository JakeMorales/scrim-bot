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
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.');
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = interaction.member;
        if (member instanceof discord_js_1.GuildMember) {
            const joinedAt = member.joinedAt;
            if (joinedAt) {
                yield interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${joinedAt}.`);
            }
            else {
                yield interaction.reply(`This command was run by ${interaction.user.username}, but I couldn't determine when they joined.`);
            }
        }
        else {
            yield interaction.reply(`This command was run by ${interaction.user.username}, but I couldn't determine when they joined.`);
        }
    });
}
