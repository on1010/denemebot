const { Highrise } = require("highrise-js-sdk");
const { settings, authentication } = require("./config/config");

const bot = new Highrise(authentication.token, authentication.room);
const { generatePlayersLength, getUptime, getRandomEmote } = require("./utils/utils");

// Event emitted when the bot has successfully connected to the chat server.
bot.on('ready', async (client) => {
  console.log(`${settings.botName}(${client}) is now online in ${settings.roomName} with ${await generatePlayersLength(bot)} players.`);
  bot.player.teleport(client, settings.coordinates.x, settings.coordinates.y, settings.coordinates.z, settings.coordinates.facing);
});

// Event emitted when a chat message is created.
bot.on('chatMessageCreate', async (user, message) => {
  console.log(`(chat): [${user.username}]: ${message}`);
  const prefix = settings.prefix;
  if (message.startsWith(`${prefix}uptime`)) {
    bot.message.send(await getUptime());
  };
  if (message.startsWith(`${prefix}ping`)) {
    const latency = await bot.ping.get()
    bot.message.send(`🤖 The bot latency is: ${latency}ms`)
  }
  if (message.startsWith(`${prefix}emote`)) {
    if (settings.moderators.includes(user.id)) {
      const players = await bot.room.players.fetch();
      const randomEmote = await getRandomEmote();
      players.forEach(async (player) => {
        const playerId = player[0].id;
        await bot.player.emote(playerId, randomEmote);
      });
    } else {
      bot.whisper.send(user.id, `You don't have permissions to use this command.`)
    }
  }
});

// Sunucu oluşturma ve proje aktivitesi sağlama.
const express = require('express');
const app = express();
const port = 3000;

// Web sunucu
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı bağlantı noktasında yürütülüyor.`);
});

// Event emitted when a whisper message is created.
bot.on('whisperMessageCreate', (user, message) => {
  console.log(`(whisper)[${user.username}]: ${message}`);
});

// Event emitted when an emote is created.
bot.on('emoteCreate', (sender, receiver, emote) => {
  console.log(`[emoteCreate]: ${sender.username} sent ${emote} to ${receiver.username}`);
});

// Event emitted when a reaction is created.
bot.on('reactionCreate', async (sender, receiver, reaction) => {
  console.log(`[reactionCreate]: ${sender.username} sent ${reaction} to ${receiver.username}`);
  if (settings.moderators.includes(sender.id) && reaction === settings.reactionName) {
    if (!settings.moderators.includes(receiver.id)) {
      bot.whisper.send(receiver.id, `You were kicked by the moderator @${sender.username}.`);
      await bot.player.kick(receiver.id);
    } else {
      bot.whisper.send(sender.id, `The player you tried to kick is a moderator.`)
    }
  }
});

// Event emitted when a tip reaction is created.
bot.on('tipReactionCreate', (sender, receiver, item) => {
  console.log(`[tipReactionCreate]: Tip reaction from ${sender.username} to ${receiver.username}: ${item.amount} ${item.type}`);
  bot.message.send(`@${sender.username} tipped ${receiver.username} ${item.amount} ${item.type} 😎`);
});

// Emitted when a player joins the room.
bot.on('playerJoin', (user) => {
  console.log(`[playerJoin]: ${user.username}(${user.id}) Joined the room`);
  bot.message.send(`@${user.username} welcome to ${settings.roomName} 🥰`)
});

// Emitted when a player leaves the room.
bot.on('playerLeave', (user) => {
  console.log(`[playerLeave]: ${user.username}(${user.id}) Left the room`);
  bot.message.send(`@${user.username} left the room 👋`)
});

// Emitted when a player moves or teleports in the game.
bot.on('TrackPlayerMovement', (position) => {
  if ('x' in position && 'y' in position && 'z' in position && 'facing' in position) {
    console.log(`[TrackPlayerMovement]: ${user.username} moved to ${position.x}, ${position.y}, ${position.z}, ${position.facing}`);
  } else if ('entity_id' in position && 'anchor_ix' in position) {
    console.log(`[TrackPlayerMovement]: ${user.username} moved to anchor ${position.entity_id} at index ${position.anchor_ix}`);
  }
});