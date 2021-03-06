module.exports = {
  name : 'power',
  description : 'start/stop/restart/kill',
  
  async run(Discord, client, prefix, message, args, axios, adminRoleID, APIFetcher, bytesConverter, percentageCalculator, timeConverter){
    if(!message.member.roles.cache.has(adminRoleID)){
      return;
    }
    let hosturl = client.config.panel.url;
    if (!hosturl.includes('http')) hosturl = 'http://' + hosturl;
    if(!hosturl.endsWith("/")) hosturl = hosturl + "/";
    let embed = new Discord.MessageEmbed()
      .setColor(0x2f3136)
    if ((!args[0])) {
      embed.setTitle("Please provide your server identifier.")
        .setDescription(`Don't know what a server identifier is?
      Open your server's console and see the code at the last of console url.
      Eg- \`https://your.host.url/server/4c09a487\`.
      Here, \`4c09a487\` is the server identifier.`)
        .setColor(0xff4747)
      await message.channel.send(embed).catch(error => { })
      return
    }
    if (args[0].length != 8) {
      embed.setTitle("Please provide a correct server identifier.")
        .setDescription(`Don't know what a server identifier is?
        Open your server's console and see the code at the last of console url.
        Eg- \`https://your.host.url/server/4c09a487\`.
        Here, \`4c09a487\` is the server identifier.`)
        .setColor(0xff4747)
      await message.channel.send(embed).catch(error => { })
      return
    }
    try {
      let powerSignal;
      let powerText = "**POWER ACTIONS**\nã¤ð¢ START\nã¤ð¡ RESTART\nã¤ð´ STOP\nã¤â KILL\nã¤ðï¸ CANCEL";
      let adminAccountAPIKey = client.config.adminAccountAPIKey
      let responseData = await APIFetcher(client, "client", `/servers/${args[0]}/resources/`, 1)
      let attributes = responseData.attributes
      let isSuspended = attributes.is_suspended
      responseData = await APIFetcher(client, "client", `/servers/${args[0]}/`, 1)
      attributes = responseData.attributes
      let name = attributes.name
      let node = attributes.node
      let id = attributes.internal_id;
      let uuid = attributes.uuid
      let description = attributes.description
      let isInstalling = attributes.is_installing
      if(!description){
        description = " "
      }
      if(description.length>60){
        description.length = 57
        description = description + "..."
      }
      if(isInstalling){
        embed.setTitle("Server Stats")
          .setDescription(`**ID**- \`${id}\`.
          **UUID**- \`${uuid}\`.
          **Name**- \`${name}\`.
          **Description**- \`${description}\`.
          **Node**- \`${node}\`.
          **INSTALLING**.`)
          .setColor(0xFFA500)
        await message.channel.send(embed).catch(error => {})
      }
      else if(isSuspended){
        embed.setTitle("Server Stats")
          .setDescription(`**ID**- \`${id}\`.
          **UUID**- \`${uuid}\`.
          **Name**- \`${name}\`.
          **Description**- \`${description}\`.
          **Node**- \`${node}\`.
          **SUSPENDED**.`)
          .setColor(0xff4747)
        await message.channel.send(embed).catch(error => {})  
      }
      else{
        embed.setTitle("Server Stats")
          .setDescription(`**ID**- \`${id}\`.
          **UUID**- \`${uuid}\`.
          **Name**- \`${name}\`.
          **Description**- \`${description}\`.
          **Node**- \`${node}\`.\n
          -------------
          ${powerText}`)
          .setColor(0x95fd91)
        let msg = await message.channel.send(embed).catch(error => {})
        await msg.react('ð¢').then(
          msg.react('ð¡'),
          msg.react('ð´'),
          msg.react('â'),
          msg.react('ðï¸')
        )
        msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == 'ð¢' || reaction.emoji.name == 'ð¡' || reaction.emoji.name == 'ð´' || reaction.emoji.name == 'â' || reaction.emoji.name == 'ðï¸'),
          { max: 1, time: 30000 }).then(async collected => {
            if(collected.first().emoji.name == 'ð¢' || collected.first().emoji.name == 'ð¡' || collected.first().emoji.name == 'ð´' || collected.first().emoji.name == 'â' || collected.first().emoji.name == 'ðï¸'){
              if(collected.first().emoji.name == 'ð¢'){
                powerSignal= "start"
                powerText = "**POWER ACTION** - ã¤ð¢ STARTING";
              }
              else if(collected.first().emoji.name == 'ð¡'){
                powerSignal= "restart"
                powerText = "**POWER ACTION** - ã¤ð¡ RESTARTING";
              }
              else if(collected.first().emoji.name == 'ð´'){
                powerSignal= "stop"
                powerText = "**POWER ACTION** - ã¤ð´ STOPPING";
              } 
              else if(collected.first().emoji.name == 'â'){
                powerSignal= "kill"
                powerText = "**POWER ACTION** - ã¤â KILLED";
              }
              else if(collected.first().emoji.name == 'ðï¸'){
                powerSignal= null
                powerText = "**POWER ACTION** - ã¤ðï¸ CANCELED";
              }
              if(powerSignal){
                await axios({
                  method: 'post',
                  url: `${hosturl}api/client/servers/${args[0]}/power`,
                  data: {
                    "signal": powerSignal
                  },
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + adminAccountAPIKey
                  }
                })
              }
              await msg.reactions.removeAll()
              embed.setTitle("Server Stats")
              .setDescription(`**ID**- \`${args[0]}\`.
              **UUID**- \`${uuid}\`.
              **Name**- \`${name}\`.
              **Description**- \`${description}\`.
              **Node**- \`${node}\`.\n
              -------------
              ${powerText}`)
              .setColor(0x95fd91)
              await msg.edit(embed).catch(error => {})
            }
        }).catch(async() => {
          powerText = "**POWER ACTION** - ã¤ðï¸ CANCELED";
          await msg.reactions.removeAll()
          embed.setTitle("Server Stats")
          .setDescription(`**ID**- \`${args[0]}\`.
          **UUID**- \`${uuid}\`.
          **Name**- \`${name}\`.
          **Description**- \`${description}\`.
          **Node**- \`${node}\`.\n
          -------------
          ${powerText}`)
          .setColor(0x95fd91)
          await msg.edit(embed).catch(error => {})
        });
      }
    } catch {
      embed.setTitle("Invalid Server identifier.")
        .setDescription(`Don't know what a server identifier is?
        Open your server's console and see the code at the last of console url.
        Eg- \`https://your.host.url/server/4c09a487\`.
        Here, \`4c09a487\` is the server identifier.`)
        .setColor(0xff4747)
      await message.channel.send(embed).catch(error => {})
      return
    }
  }
}