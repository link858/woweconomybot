
const { ActionRowBuilder, EmbedBuilder, Events, StringSelectMenuBuilder, Client, GatewayIntentBits, ButtonBuilder } = require('discord.js');
const { ask } = require("./ai.js"); //import the "ask" function from the "ai.js" file
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('economy.db');
const axios = require('axios');
const logChannelId = "<CHANNEL ID FOR LOGGING>"// Channel to send logs
const staff_role = "<roleID>"// Role allowed to use restricted commands
const healers_tanks = ['<name>', '<name>', '<name>']; //Add as many as you want
const BOT_TOKEN = "<YOUR API KEY>" //Discord API KEY
const warcraftLogAPI = "<YOUR WARCRAFT LOGS API KEY>"


// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

  

//Creates the DB specified if none exists
db.run(`
  CREATE TABLE IF NOT EXISTS shop (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (discord_id) REFERENCES characters (discord_id),
    FOREIGN KEY (item_name) REFERENCES shop (name)
  );
`);
db.run(`CREATE UNIQUE INDEX IF NOT EXISTS inventory_unique_constraint ON inventory (discord_id, item_name)`);

db.run(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL,
    last_quest_time INTEGER NOT NULL
  );
`);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const logChannel = client.channels.cache.get(logChannelId);
  
  if (logChannel) {
    
    console.log('Log Channel Found.');
  } else {
    console.error(`Could not find the specified "Log Channel"`);
  }
  // logChannel.send("This is a message sent to a specific channel!")
  //   .then(message => console.log(`Sent message: ${message.content}`))
  //   .catch(console.error);



//   const guildId = ''
//   const guild = client.guilds.cache.get(guildId)
//   let commands
//   if (guild) {
//     commands = guild.commands
//   } else {
//     commands = client.application?.commands
//   }
//   commands.fetch('1071385185704222770') // id of your command
//   .then( (command) => {
// console.log(`Fetched command ${command.name}`)
// // further delete it like so:
// command.delete()
// console.log(`Deleted command ${command.name}`)
// }).catch(console.error);
});




client.on('messageCreate', async msg => {
  const adminRole = msg.guild.roles.cache.some(role => role.id === staff_role)
  const logChannel = client.channels.cache.get(logChannelId);
//////////////////////////////////////////////////////////////////


// REGISTER COMMAND

  if (msg.content.startsWith('$register')) {
    const args = msg.content.split(' ');
    if (!args[1]) return msg.reply('Please provide a character name.');
    const name = args[1].toLowerCase();
    const discordId = msg.author.id;
    const user = msg.member.displayName;

    

    // if (!name) return msg.reply('Please provide a character name.');
  
    db.get(`SELECT * FROM characters WHERE name='${name}' OR discord_id='${discordId}'`, (err, row) => {
      if (err) return console.error(err);
      if (row) return msg.reply(`Character "${name}" is taken or Your Discord Account already has a character registered to it.`);
  
      db.run(`INSERT INTO characters (name, discord_id, balance, last_quest_time) VALUES ('${name}', '${discordId}', 1, 1)`, (err) => {
        if (err) return console.error(err);
        console.log(`Discord User: ${user} has Registered Character: ${name}`);
        logChannel.send(`***LOG:*** Discord User: <@${discordId}> has Registered Character: ${name}`)

        msg.reply(`Character "${name}" has been registered.`);
      });
    });
  }



// HELP COMMAND
if (msg.content === '$help') {
  const embed = new EmbedBuilder()
      .setAuthor({ name: `Day Raiders`, iconURL: "https://media.discordapp.net/attachments/935250237671477330/1023608209572905072/512x512.png"})
      .setTitle(`This is a list of available commands`)
      .setDescription(`Register your character with ***$register mugglemike***\n
      See whats in the bank with ***$balance***\nComplete a daily quest for rewards with ***$quest***\nBuy items using ****$buy item amount****\nItems are stored in your ***$inventory***\nGive items using ***$give charName item amount***\nRedeem items for delivery using ***$redeem item amount***\n Ask ChatGPT a question through the bot with ***$ask question***`)
      .setColor(0xff0000);
      msg.reply({ embeds: [embed] });
    }

  // SHOP COMMAND
  // if (msg.content === '$shop') {
  //  const shop = await getItems();
  // const message = new EmbedBuilder()
  //   .setTitle('Shop')
  //   .setColor(0xff0000)
  //   .setDescription(shop.map(item => `${item.name} - $${item.price}`).join('\n'));
  //   msg.reply({ embeds: [message] });
  // }


  if (msg.content === '$shop') {
    const shop = await getItems();
    let i = 0;
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Day Raiders`, iconURL: "https://media.discordapp.net/attachments/935250237671477330/1023608209572905072/512x512.png"})
      .setTitle(`Welcome to the Point Shop`)
      .setDescription(`**This is a list of available items in the shop**\nUse ***$buy flasks*** with the name to purchase it.\nSelect from the dropdown which type if asked.`)
      .setFooter({ text: `PRICES SUBJECT TO CHANGE\nMore ways to earn points will come\nMore items will come`})
      .setColor(0xff0000);
      
    while (i < shop.length) {
    const fields = [];
    for (let j = 0; j < 4 && i < shop.length; j++) {
    fields.push({ name: `***${shop[i].name.toUpperCase()}***`, value: `Points: ***${shop[i].price}***\n${shop[i].description}`, inline: j < 4 });
    i++;
    }
    embed.addFields(fields)
    
    
    }
    embed.addFields({ name: `questions/suggestions/problems?`, value: `<@207458053849743360>`})

    msg.reply({ embeds: [embed] });
  }



  if (msg.content === '$shoplist') {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');
    const shop = await getItems();
    let i = 0;
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Day Raiders`, iconURL: "https://media.discordapp.net/attachments/935250237671477330/1023608209572905072/512x512.png"})
      .setTitle(`Welcome to the Point Shop`)
      .setDescription(`**This is a list of available items in the shop**`)
      .setFooter({ text: `PRICES SUBJECT TO CHANGE\nMore ways to earn points will come\nMore items will come`})
      .setColor(0xff0000);
      
    while (i < shop.length) {
    const fields = [];
    for (let j = 0; j < 4 && i < shop.length; j++) {
    fields.push({ name: `***${shop[i].name.toUpperCase()}***`, value: `Points: ***${shop[i].price}***\n${shop[i].description}`, inline: j < 4 });
    i++;
    }
    embed.addFields(fields)
    
    
    }
    embed.addFields({ name: `questions/suggestions/problems?`, value: `<@207458053849743360>`})
  
    const embed2 = new EmbedBuilder()
    .setAuthor({ name: `Shop Info`, iconURL: "https://images.emojiterra.com/twitter/v14.0/512px/2753.png"})
    .setTitle(`How it works`)
    .setDescription(`**Go to <#1071564711990145145> to use commands please.**\n
    The bot pulls info from the **WarcraftLogs API**
    **Points** are earned from your **parse average** on 25man every week.
    **Healers/Tanks** are given a minimum of 50.
    
    Use ***$quest*** to complete a daily quest for points.
    Use ***$help*** to see available commands for the bot
    Use ***$buy*** to purchase items, using the exact name and amount you want
    **$buy abyss_crystal 1**\n
    Redeem your item for delivery the same way
    **$redeem abyss_crystal 1**
    **Redeemed** Items are delivered by mail`)
    .setColor(0xff0000);
    
    const existingMessage = await msg.channel.messages.fetch({ limit: 20, before: msg.id }).then(msgs => msgs.first());

//If the message doesn't exist, post a new one with the shop information
if (!existingMessage) {
  msg.reply({ embeds: [embed, embed2] });
}
//If the message exists, edit it with the shop information
  else {
  existingMessage.edit({ embeds: [embed, embed2] });
}
 }

  // EDIT SHOP COMMANDS
  // ADD ITEM
  // if (msg.content.startsWith('$editshop')) {
  //   if (!adminRole) return msg.reply('You do not have permission to use this command.');
  //   return msg.reply('use add/edit/remove to change the shop items')
    
  // }
  
 if (msg.content.startsWith('$editshop add')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');

    const args = msg.content.split(' ');
    if (!args[2] || isNaN(args[3]) || !args[4]) return msg.reply('Please provide a item name, price, and description to add.');
    const item_name = args[2].toLowerCase();
    const price = parseInt(args[3]);
    const description = args.slice(4).join(" ");
  
    db.run(`INSERT INTO shop (name, price, description) VALUES ('${item_name}', ${price}, '${description}')`, (err) => {
      if (err) return console.error(err);
      msg.reply(`Item "${item_name}" has been added to the shop\nfor the price of $${price} with the description:\n"${description}".`);
    });
}

// REMOVE ITEM
if (msg.content.startsWith('$editshop remove')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');

    const args = msg.content.split(' ');
    if (!args[2]) return msg.reply('Please provide a item name to remove.');
    const item_name = args[2].toLowerCase();
  
  
    db.run(`DELETE FROM shop WHERE name='${item_name}'`, (err) => {
      if (err) return console.error(err);
      msg.reply(`Item "${item_name}" has been removed from the shop.`);
    });
}
////// EDIT ITEM
if (msg.content.startsWith('$editshop edit')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');

    const args = msg.content.split(' ');
    if (!args[2] || !args[3]) return msg.reply('Please provide an item name and price to edit.');
    const item_name = args[2].toLowerCase();
    const new_name = args[3].toLowerCase();
    const price = parseInt(args[4]);
    const description = args.slice(5).join(" ");

    if (!args[4] || !args[5]) {
      db.run(`UPDATE shop SET name = '${new_name}' WHERE name='${item_name}'`, (err) => {
        if (err) return console.error(err);
        msg.reply(`Item "${item_name}" name has been edited to ***${new_name}.***`);
      });
    } else {
      db.run(`UPDATE shop SET price = ${price}, description = '${description}', name = '${new_name}' WHERE name='${item_name}'`, (err) => {
        if (err) return console.error(err);
        msg.reply(`Item "${item_name}" has been edited to ***${new_name}*** in the shop\nFor the price of ***$${price}***\n With the description:\n***"${description}"***.`);
      });
    }
      

    //if (!item_name || isNaN(price)) return msg.reply('Please provide an item name and price to edit.');

}



 

if(msg.content.startsWith("$ask")) {
    let question = msg.content.substring(7);
    if (!question) return msg.reply('Ask the bot a question using ChatGPT') 
    const answer = await ask(question)
      msg.reply(answer);

        };



  // ADD CURRENCY COMMAND
  if (msg.content.startsWith('$add')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');

    const args = msg.content.split(' ');
    if (!args[1] || isNaN(args[2])) return msg.reply('Please provide a character name and amount to add.');
    const charname = args[1].toLowerCase();
    const amount = parseInt(args[2]);
    const discordId = msg.author.id;
    // if (!charname || isNaN(amount)) return msg.reply('Please provide a character name and amount to add.');

    const balance = await getBalanceByCharName(charname);
    if (balance === null) return msg.reply(`User with Character Name: "${charname}" has not registered a character yet.`);

    db.run(`UPDATE characters SET balance = ${balance + amount} WHERE name='${charname}'`);
    logChannel.send(`<@${discordId}> added $${amount} to\nCharacter Name: "${charname}", and now their balance is $${balance + amount}.`)
    msg.reply(`You have added $${amount} to\nCharacter Name: "${charname}", and now their balance is $${balance + amount}.`);
}

  // SUBTRACT CURRENCY COMMAND
if (msg.content.startsWith('$subtract')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');

    const args = msg.content.split(' ');
    
    if (!args[1] || isNaN(args[2])) return msg.reply('Please provide a character name and amount to subtract.');
    
    const charname = args[1].toLowerCase();
    const amount = args[2];
  

    const balance = await getBalanceByCharName(charname);
    if (balance === null) return msg.reply(`User with Character Name: "${charname}" has not registered their character yet.`);
    if (balance < amount) return msg.reply(`The balance of user with Character Name: "${charname}" is $${balance}, which is not enough to subtract $${amount}.`);

    db.run(`UPDATE characters SET balance = ${balance - amount} WHERE name='${charname}'`);
    logChannel.send(`<@${discordId}> subtracted $${amount} from\nCharacter Name: "${charname}", and now their balance is $${balance - amount}.`)
    msg.reply(`You have subtracted $${amount} from\nCharacter Name: "${charname}", and now their balance is $${balance - amount}.`);
}

// REDEEM ITEM
if (msg.content.startsWith('$redeem')) {
  const args = msg.content.split(' ');

  if (!args[1] || isNaN(args[2])) return msg.reply('Please provide a item name and amount to redeem.');

  const itemName = args[1].toLowerCase();
  //itemName.toLowerCase()
  const amount = parseInt(args[2]);
  const discordId = msg.author.id;
  const user = msg.member.displayName;

  //if (!itemName || isNaN(amount)) return msg.reply('Please provide a item name and amount to redeem.');

  db.get(`SELECT * FROM shop WHERE name='${itemName}'`, (err, shopRow) => {
    if (err) return console.error(err);
    if (!shopRow) return msg.reply(`Item "${itemName}" is not available in the shop.`);

    db.get(`SELECT * FROM inventory WHERE discord_id='${discordId}' AND item_name='${itemName}'`, (err, inventoryRow) => {
      if (err) return console.error(err);
      if (!inventoryRow) return msg.reply(`You do not have "${itemName}" in your inventory.`);
      if (inventoryRow.amount < amount) return msg.reply(`You only have ${inventoryRow.amount} of "${itemName}" in your inventory.`);

      if (inventoryRow.amount == amount) {
        db.run(`DELETE from inventory where discord_id='${discordId}' AND item_name='${itemName}'`, (err) => {
          if (err) return console.error(err);

          
          if (!adminRole) return console.error('Admin role not found in the guild');

          msg.reply(`You have redeemed ${amount} "${itemName}" from your inventory.\n***Your items will be sent by mail.***`);
          logChannel.send(`***Redeem:*** <@&${staff_role}> <@${discordId}> has redeemed ${amount} of "${itemName}" from their inventory.`);
          console.log(`${user} has redeemed ${amount} of "${itemName}" from their inventory.`);
        });
      } else {
        
        db.run(`UPDATE inventory SET amount=amount-${amount} WHERE discord_id='${discordId}' AND item_name='${itemName}'`, (err) => {
          if (err) return console.error(err);

          
          if (!adminRole) return console.error('Admin role not found in the guild');

          msg.reply(`You have redeemed ${amount} of "${itemName}" from your inventory.\n***Your items will be sent by mail.***`);
          logChannel.send(`<@&${staff_role}> <@${discordId}> has redeemed ${amount} of "${itemName}" from their inventory.`);
          console.log(`${user} has redeemed ${amount} of "${itemName}" from their inventory.`);
        });
      }
    });
  });
}


  // BALANCE COMMAND
  if (msg.content === '$balance') {
    const balance = await getBalance(msg.author.id);
    const user = await getCharacter(msg.author.id);
    if (balance === null) return msg.reply('You have not registered a character yet. Use "$register character_name" to register.');
    msg.reply(`Your character is ${user}\nYour balance is $${balance}.`);
  }

// GET PLAYER BALANCE COMMAND
  if (msg.content.startsWith('$getbal')) {
    if (!adminRole) return msg.reply('You do not have permission to use this command.');
    
    const args = msg.content.split(' ');
    if (!args[1]) return msg.reply('Please provide a character name');
    const charName = args[1].toLocaleLowerCase();

    //if (!charName) return msg.reply('Please provide a character name.');

    const balance = await getBalanceByCharName(charName);
    if (!balance) return msg.reply(`Character "${charName}" not found.`);
    return msg.reply(`The balance of "${charName}" is $${balance}.`);
  }

  // check parse average command
  if (msg.content.startsWith('$parse')) {
    const args = msg.content.split(' ');
    const charName = args[1];
    const report = args[2];

    

    if(!charName || !report) return msg.reply('Grab a characters overall parse average from a warcraftlog report id. ($parse mugglemike c9hpQmYGnDtBRjyX');

    getAveragePercentile(charName, report)
    .then(avg => {
      console.log(`Character: ***${charName}***\nParse Average:***${avg}***`);
      return msg.reply(`Character: ***${charName}***\nParse Average: ***${avg}***`);
    });
  
    
};


  // Give User Item Command
  if (msg.content.startsWith('$give')) {
    const args = msg.content.split(' ');
    if (!args[1] || !args[2] || isNaN(args[3])) return msg.reply('Please provide a valid receiver name, item name, and amount.');
    const receiverName = args[1].toLowerCase();
    const itemName = args[2].toLowerCase();
    const amount = parseInt(args[3]);
    const senderDiscordId = msg.author.id;

    //if (!receiverName || !itemName || isNaN(amount) || amount < 1) return msg.reply('Please provide a valid receiver name, item name, and amount.');
  
    // Get the receiver character
    db.get(`SELECT * FROM characters WHERE name='${receiverName}'`, (err, receiver) => {
      if (err) return console.error(err);
      if (!receiver) return msg.reply(`Character "${receiverName}" does not exist.`);

      // Get the sender's inventory
      db.get(`SELECT * FROM inventory WHERE discord_id='${senderDiscordId}' AND item_name='${itemName}'`, (err, senderInventory) => {
        if (err) return console.error(err);
        if (!senderInventory) return msg.reply(`You do not have any "${itemName}" in your inventory.`);
        if (senderInventory.amount < amount) return msg.reply(`You do not have enough "${itemName}" in your inventory.`);

        // Check if the receiver already has the item in their inventory
        db.get(`SELECT * FROM inventory WHERE discord_id='${receiver.discord_id}' AND item_name='${itemName}'`, (err, receiverInventory) => {
          if (err) return console.error(err);
          
          if (!receiverInventory) {
            db.run(`INSERT INTO inventory (discord_id, item_name, amount) VALUES ('${receiver.discord_id}', '${itemName}', ${amount})`, (err) => {
              if (err) return console.error(err);
              msg.reply(`You have given ${amount} of "${itemName}" to "${receiverName}".`);

              if (senderInventory.amount == amount) {
                db.run(`DELETE from inventory where discord_id='${senderDiscordId}' AND item_name='${itemName}'`, (err) => {
                  if (err) return console.error(err);})}
            });
          } else {
            db.run(`UPDATE inventory SET amount=amount+${amount} WHERE discord_id='${receiver.discord_id}' AND item_name='${itemName}'`, (err) => {
              if (err) return console.error(err);
              msg.reply(`You have given ${amount} of "${itemName}" to "${receiverName}".`);
              logChannel.send(`<@${discordId}> has given ${amount} of "${itemName}" to "${receiverName}"`)
              if (senderInventory.amount == amount) {
                db.run(`DELETE from inventory where discord_id='${senderDiscordId}' AND item_name='${itemName}'`, (err) => {
                  if (err) return console.error(err);})}
            });
          }

          db.run(`UPDATE inventory SET amount=amount-${amount} WHERE discord_id='${senderDiscordId}' AND item_name='${itemName}'`, (err) => {
            if (err) return console.error(err);
          });
        });
      });
    });
  }
  //  BUY COMMAND
  if (msg.content.startsWith('$buy')) {
    const args = msg.content.split(' ');

    if (!args[1] || isNaN(args[2])) return msg.reply('Please provide an item name and/or amount');

    const itemName = args[1].toLowerCase();
    const amount = args[2];
    const discordId = msg.author.id;
    const user = msg.member.displayName;
    //if (!itemName || !amount) return msg.reply('Please provide an item name and/or amount');
  
    const item = await getItem(itemName);
    if (!item) return msg.reply(`Item "${itemName}" does not exist in the shop.`);
  
    const balance = await getBalance(discordId);
    if (balance === null) return msg.reply('You have not registered a character yet. Use "$register character_name" to register.');
    if (balance < item.price) return msg.reply(`You do not have enough currency to buy "${item.name}".`);
  
    db.run(`
    INSERT INTO inventory (discord_id, item_name, amount)
    VALUES ('${discordId}', '${itemName}', ${amount})
    ON CONFLICT (discord_id, item_name) DO
      UPDATE SET amount = inventory.amount + ${amount}
    WHERE inventory.discord_id = '${discordId}' AND inventory.item_name = '${itemName}';
  `, (err) => {
    if (err) return console.error(err);
  });
  
    db.run(`UPDATE characters SET balance = ${balance - (item.price * amount)} WHERE discord_id = ${discordId}`);
    console.log(`${user} has bought ${amount} "${item.name}" for $${item.price} and now have a balance of ${balance - item.price}.`);
    logChannel.send(`***LOG:*** <@${discordId}> has bought ${amount} "${item.name}" for $${item.price} and now have a balance of ${balance - (item.price * amount)}.`)
    msg.reply(`You have bought ${amount} "${item.name}" for $${item.price} each and now have a balance of ${balance - (item.price * amount)}.`);
    
  }


  // INVENTORY COMMAND
  if (msg.content === '$inventory') {
    const discordId = msg.author.id;
    const items = await getInventoryByDiscordId(discordId);
    if (!items.length) return msg.reply('Your inventory is empty.');
    const message = items.map(item => `${item.item_name} x${item.amount}`).join('\n');
    msg.reply(`Inventory:\`\`\`${message}\`\`\``);
  }

// setup shop command

// if (msg.content === '$setupshop') {
//   const shop = await getItems();
//   const shopList = shop.map(item => item.name);
//   const menu = new StringSelectMenuBuilder(msg.channel, {
//     title: 'Shop',
//     items: shopList,
//   });
//   menu.start(msg.author.id, {
//     onAction: async (item, action) => {
//       if (action === 'selected') {
//         const selectedItem = shop.find(i => i.name === item);
//         const itemEmbed = new EmbedBuilder()
//           .setTitle(selectedItem.name)
//           .addField('Price', `$${selectedItem.price}`);
//         msg.reply(itemEmbed);
//       }
//     },
//   });
// }



  if (msg.content === '$blackjack') {
    const balance = await getBalance(msg.author.id);
    if (balance === null) return msg.reply('You have not registered a character yet. Use "$register charactername" to register.');
    if (balance === 0) return msg.reply('You do not have enough currency to play blackjack.');

    // Play blackjack and update the balance
    const result = playBlackjack();
    db.run(`UPDATE characters SET balance = ${balance + result} WHERE discord_id = ${msg.author.id}`);
    msg.reply(`You won/lost ${result} and now have a balance of ${balance + result}.`);
  }




if (msg.content.startsWith('$updatepoints')){
  const args = msg.content.split(' ');
  if(!adminRole) return msg.reply('You do not have permission to do that')
  if(!args) return msg.reply('you need to put in a report id');

  const reportId = args[1];
  const updates = [];
  
  db.all('SELECT discord_id, name FROM characters', [], (err, rows) => {
    if (err) {
      throw err;
    }
  
    rows.forEach(async (row) => {
      const averagePercentile = await getAveragePercentile(row.name, reportId);
  
      console.log(`Name: ${row.name}`);
      console.log(`Average Percentile: ${averagePercentile}`);
        // Add the averagePercentile to the balance of the character
        db.run(`UPDATE characters SET balance = balance + ${averagePercentile} WHERE name = '${row.name}'`, (err) => {
          if (err) {
            throw err;
          }
          updates.push({ name: row.name, balance: averagePercentile });
        });
      });
  
      setTimeout(() => {
        // Create embed message with updates
        const embed = new EmbedBuilder()
          .setTitle('Character Point Updates')
          .setColor('#0099ff')
          .setDescription('The following characters have had their points updated by the following amounts:');
        
        updates.forEach((update) => {
          embed.addFields({ name: update.name, value: `${update.balance}`, inline: true });

        });
        
        msg.reply({embeds: [embed]});
      }, 2000);
  });
  
  msg.reply('points updated');

}



if (msg.content.startsWith('$test')){
  msg.channel.send({
    embed: {
      title: "Title of embed",
      description: "Description of embed",
      fields: [
        {
          name: "Button 1",
          value: `[Click here](https://discordapp.com/api/oauth2/authorize?client_id=${msg.author.id}&scope=bot&permissions=0)`,
          inline: true
        },
        {
          name: "Button 2",
          value: `[Click here](https://discordapp.com/api/oauth2/authorize?client_id=${msg.author.id}&scope=bot&permissions=0)`,
          inline: true
        }
      ],
      footer: {
        text: `${msg.author.username} pressed the button!`
      }
    }
  });
}

//////////////// QUEST COMMAND

if (msg.content.startsWith('$quest')) {
  const quests = [
    {message: "Accepted a quest to slay a dragon and you returned victorious. Too bad it was just a baby, **Your reward is $5.**", reward: 5},
    {message: "Accepted a quest to retrieve the lost treasure of Captain Kidd. Not much left, **Your reward is $10.**", reward: 10},
    {message: "Accepted a quest to save a prince from a tower. He wasnt much of a prince, **Your reward is $10.**", reward: 10},
    {message: "Accepted a quest to track down a mythical creature. Turns out it was your mother, **Your reward is $15.**", reward: 15},
    {message: "Accepted a quest to find the source of a strange noise. You only found Murlocs. **Your reward is $10.**", reward: 10},
    {message: "Accepted a quest to investigate a disturbance in the Emerald Dream. You found the source of the disturbance and resolved it. **Your reward is $15.**", reward: 15},
    {message: "Accepted a quest to defend a village from a horde of orcs. You successfully defend the village, **Your reward is $15.**", reward: 15},
    {message: "A group of goblins have been stealing supplies from a nearby town. You were hired to track down the goblin hideout and recover the stolen goods. After a challenging fight, you were able to defeat the goblins and retrieve the supplies, **Your reward is $15.**", reward: 15},
    {message: "The leaders of a small town have heard rumors of a powerful artifact hidden in a nearby tomb. They request your aid in finding and retrieving it, promising a handsome reward. The tomb is guarded by powerful undead creatures, but with your strength and wits, you were able to obtain the artifact and return it to the town. **Your reward is $20**.", reward: 20},
    {message: "The local innkeeper has lost his prized recipe book, and he's willing to pay handsomely for its safe return. You set out on a quest to recover the book and bring it back to the innkeeper. **Your reward is $15.**", reward: 15},
    {message: "Accepted a quest to defend a village from a horde of orcs. You successfully defend the village, **Your reward is $15.**", reward: 15},
    {message: "Accepted a quest to defend a village from a horde of orcs. You successfully defend the village, **Your reward is $15.**", reward: 15},
    {message: "Accepted a quest to defend a village from a horde of orcs. You successfully defend the village, **Your reward is 15.**", reward: 15},

  ];
  const randomQuest = quests[Math.floor(Math.random() * quests.length)];

  db.get(`SELECT * FROM characters WHERE discord_id = '${msg.author.id}'`, (err, row) => {
    if (err) return console.error(err);
    if (!row) {
      msg.reply('You havent registered a character');
    } else {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - row.last_quest_time < 86400) { // 86400 seconds = 24 hours
        msg.reply('You have already completed a quest today, come back tomorrow.');
      } else {
        db.run(`UPDATE characters SET balance = ${row.balance + randomQuest.reward}, last_quest_time = ${currentTime} WHERE discord_id = '${msg.author.id}'`);
        msg.reply(randomQuest.message);
      }
    }
  });
}







if (msg.content === '$lottery') {
  const lotteryEmbed = new EmbedBuilder()
    .setTitle('Lottery')
    .setDescription('Purchase a lottery ticket for 50g')
    // fields.push({ name: `***${shop[i].name.toUpperCase()}***`, value: `Points: ***${shop[i].price}***\n${shop[i].description}`, inline: j < 4 });
    .addFields(
      { name:'Tickets Purchased', value: 'No tickets purchased yet.'});

  // const buyButton = new ButtonBuilder()
  //   .setCustomId('buy')
  //   .setLabel('Buy Ticket')
  //   .setStyle('PRIMARY');

  // const drawButton = new ButtonBuilder()
  //   .setCustomId('draw')
  //   .setLabel('Draw Winner')
  //   .setStyle('DANGER')
  //   .setDisabled(true);

  // const buttonRow = new ActionRowBuilder().addComponents(buyButton, drawButton);

  const lotteryMessage = await msg.channel.send({ embeds: [lotteryEmbed], components: [buttonRow] });

  const tickets = [];

  const collector = lotteryMessage.createMessageComponentCollector({
    filter: i => i.customId === 'buy' && i.user.id === msg.author.id,
    time: 60000
  });

  collector.on('collect', i => {
    const ticketNumber = Math.floor(Math.random() * 100) + 1;

    if (!tickets.includes(ticketNumber)) {
      tickets.push(ticketNumber);
      lotteryEmbed.fields[0].value = tickets.join(', ');
      lotteryMessage.edit({ embeds: [lotteryEmbed], components: [buttonRow] });
      i.reply({ content: `You have purchased ticket number ${ticketNumber}.`, ephemeral: true });

      if (tickets.length > 0) {
        drawButton.setDisabled(false);
        lotteryMessage.edit({ components: [buttonRow] });
      }
    } else {
      i.reply({ content: 'You have already purchased a ticket with that number.', ephemeral: true });
    }
  });

  collector.on('end', collected => {
    if (tickets.length > 0) {
      const winner = tickets[Math.floor(Math.random() * tickets.length)];
      const winnerEmbed = new EmbedBuilder()
        .setTitle('Lottery Winner')
        .setDescription(`The winner is ticket number ${winner}!`)
        .addFields(
          { name: 'Winner', value: `<@${msg.author.id}>` })
        .setFooter('Congratulations!');
      msg.channel.send({ embeds: [winnerEmbed] });
    }
  });
}















// if (msg.content.startsWith("$lottery")){
//   // const args = msg.content.split(' ');
  
//   // if(!args) return msg.reply('Put in a prize amount');
  
//     // const userId = msg.author.id;
//     // const userRows = await getAllRows(userId)

//     // if (userRows.length === 0) {
//     //   msg.reply('You must create a character first!');
//     //   return;
//     // }

//     // const userBalance = userRows[0].balance;

//     // if (userBalance < 50) {
//     //   msg.reply('You don\'t have enough gold to purchase a lottery ticket!');
//     //   return;
//     // }

//     // const lotteryId = getRandomInt(1, 100);

//     //  db.run('INSERT INTO inventory (discord_id, item_name, amount) VALUES (?, ?, 1)', [userId, `Lottery Ticket #${lotteryId}`]);
//     //  db.run('UPDATE characters SET balance = ? WHERE discord_id = ?', [userBalance - 50, userId]);

//      const ticketRows = db.all('SELECT discord_id FROM inventory WHERE item_name LIKE ?', ['Lottery Ticket%']);
//      const ticketCount = ticketRows.length;

//     const ticketEmbed = new MessageEmbed()
//       .setTitle('Lottery Ticket Sales')
//       .setDescription(`Tickets sold: `)//${ticketCount}`)
//       .setColor('#ffcc00');

//     if (ticketCount == 0) {
//       const ticketUsers = ticketRows.map(row => `<@${row.discord_id}>`);
//       ticketEmbed.addField('Ticket Holders', ticketUsers.join('\n'));
//     }

//     const ticketButton = new MessageButton()
//       .setCustomId('buy_ticket')
//       .setLabel('Purchase a Ticket')
//       .setStyle('PRIMARY');

//     const adminButton = new MessageButton()
//       .setCustomId('pick_winner')
//       .setLabel('Pick a Winner')
//       .setStyle('DANGER')
//       .setDisabled(!message.member.roles.cache.some(role => role.name === 'Admin'));

//     const buttonRow = new MessageActionRow()
//       .addComponents(ticketButton, adminButton);

//     const purchaseEmbed = new MessageEmbed()
//       .setTitle(`Lottery Ticket #${lotteryId}`)
//       .setDescription('Congratulations on your purchase! Good luck!')
//       .setColor('#00ff00');

//     const purchaseRow = new MessageActionRow()
//       .addComponents(new MessageButton()
//         .setCustomId('nothing')
//         .setLabel('Nothing')
//         .setStyle('SECONDARY')
//         .setDisabled(true));

//     msg.reply({ embeds: [purchaseEmbed], components: [purchaseRow, buttonRow] });
  
// };







// ENDING FOR messageCreate
});



// END OF COMMANDS


////HELPER FUNCTIONS

async function getBalance(discordId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT balance FROM characters WHERE discord_id = ${discordId}`, (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.balance : null);
    });
  });
}

async function getCharacter(discordId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT name FROM characters WHERE discord_id = ${discordId}`, (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.name : null);
    });
  });
}

async function getAllRows(discordId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM characters WHERE discord_id = ${discordId}`, (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.name : null);
    });
  });
}



async function getBalanceByCharName(charName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT balance FROM characters WHERE name ='${charName}'`, (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      
      return resolve(row.balance);
    });
  });
}


function playBlackjack() {
  // Play blackjack and return the result
  // ...

  return result;
}

async function getItem(name) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM shop WHERE name = '${name}'`, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function getItems() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM shop`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}


async function getInventoryByDiscordId(discordId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT item_name, amount FROM inventory WHERE discord_id='${discordId}'`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
  });
}

// This function generates a random integer between min and max (inclusive)
async function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



async function getAveragePercentile(name, reportId) {
  let totalPercentile = 0;
  let count = 0;


  // Make API request
  const response = await axios.get(`https://classic.warcraftlogs.com/v1/parses/character/${name}/eranikus/us?api_key=${warcraftLogAPI}&report=${reportId}`);
  const data = response.data;

  // Loop through the data and find matching reportId
  for (let i = 0; i < data.length; i++) {
    if (data[i].reportID === reportId) {
      totalPercentile += Math.trunc(data[i].percentile);

      count++;
    }
  }

  // Return the average percentile
  let average = Math.trunc(totalPercentile / count);
  if (isNaN(average)) {
    average = 0;
  }
  if (healers_tanks.includes(name)) {
    console.log(`${name} is a healer/tank!`);
    if (average < 50){
      console.log(`${name} is BELOW 50. Rounding to 50`);
      average = 50;
    }
  }

 
  return average;
}


client.login(BOT_TOKEN);
