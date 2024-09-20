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
const scrimChannelData_1 = require("../models/scrimChannelData");
module.exports = {
    name: discord_js_1.Events.MessageCreate,
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scrimChannelData_1.scrimSignupChannels.has(message.channel.id)) {
                console.log('Scrim signup channel message detected');
                if (!scrimChannelData_1.whitelistedCommands.has(message.content)) {
                    const botReply = yield message.reply('Please use the bot commands for scrim signups.');
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        yield message.delete();
                        yield botReply.delete();
                        yield message.author.send('Hello world');
                    }), 15000); // 15 seconds in milliseconds
                }
            }
        });
    },
};
