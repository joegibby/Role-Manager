const { Command } = require("discord-akairo")
const { constructCommandInfo } = require("../../functions.js")

const commandInfo = constructCommandInfo(
	{
		id: "ping",
		aliases: [],
		args: [],
		description: {
			short: "Get the bot's ping.",
			extend: "Gets time taken between the command being sent and the resulting \"pong\" message to be sent.",
		}
	},
	__dirname
)

class PingCommand extends Command {
	constructor() {
		super(
			commandInfo.id,
			commandInfo
		);
	}

	exec(message) {
		return message.reply("pong").then(sent => {
			sent.edit(`${sent} (${sent.createdAt - message.createdAt}ms)`);
		});
	}
}

module.exports = PingCommand;