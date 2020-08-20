const { Command } = require("discord-akairo")
const { isRolesMessage, linkToMessage } = require("../../functions.js")

const commandInfo = {
	id: "checkRolesForReact",
	aliases: [],
	args: [{id: "messageLink", type: "string"}],
	description: {
		short: "Checks that all users with a role with a corresponding emoji have done the appropriate react.",
		extend: "If no link to a message is given, the bot will try to find it itself.",
	}
}

commandInfo.aliases.unshift(commandInfo.id)
commandInfo.description.long = commandInfo.description.short + "\n" + commandInfo.description.extend
commandInfo.description.args = commandInfo.args.map(item => item.id)
commandInfo.category = __dirname.split("\\").pop()

class CheckRolesForReactCommand extends Command {
	constructor() {
		super(
			commandInfo.id,
			commandInfo
		);
	}

	async exec(message, args) {
		let roleMessage;
		if (args.messageLink) {
			roleMessage = linkToMessage(args.messageLink, message.guild)
			if (typeof roleMessage == "string") {
				return await message.channel.send({ embed: { description: roleMessage } })
			} else if (!isRolesMessage(message)) {
				return await message.channel.send({ embed: { description: "Not a valid role message. Use the `checkRoleMessage` command for more info." } })
			}
		} else {
			let channels = message.guild.channels.cache.filter(c => c.name == "server-info" && c.type == "text")
			for (let [, c] of channels) {
				roleMessage = c.messages.cache.find(m => m.author.id == this.client.user.id && m.content.startsWith("**ROLES**"))
				if (roleMessage) {
					break
				}
			}
			if (!roleMessage) {
				return await message.channel.send({ embed: { description: "Couldn't find role message. Use the `checkRoleMessage` command for more info." } })
			}
		}
		let reactUsers = {};
		for (let [, react] of roleMessage.reactions.cache) {
			reactUsers[react.emoji.name.toLowerCase()] = await react.users.fetch()
		}
		let valid = 0,
			noReact = 0,
			noEmoji = {};
		for (let [, member] of message.guild.members.cache.filter(m => !m.user.bot)) {
			for (let [, role] of member.roles.cache) {
				if (role.name == "@everyone") {
					continue
				}
				let roleName = role.name.replace(" ", "").toLowerCase()
				if (reactUsers[roleName]) {
					if (reactUsers[roleName].some(u => u.id == member.user.id)) {
						valid ++;
					} else {
						noReact ++;
					}
				} else {
					if (noEmoji[role.id]) {
						noEmoji[role.id] ++;
					} else {
						noEmoji[role.id] = 1
					}
				}
			}
		}
		let noEmojiList = []
		for (let id in noEmoji) {
			noEmojiList.push(`	<@&${id}>: \`${noEmoji[id]}\` users have this role`)
		}
		return await message.channel.send({embed: {
			title: "checkRolesForReact results",
			description:`Checked [this message](${roleMessage.url})
			\`${valid}\` roles matched with a react
			\`${noReact}\` roles had an associated react but the user hadn't done the react
			\`${noEmojiList.length}\` roles had no associated emojis:
			${noEmojiList.join("\n")}
			
			Wrong message found? Run the \`checkRoleMessage\` command for help.`,
		}})
	}
}


module.exports = CheckRolesForReactCommand;