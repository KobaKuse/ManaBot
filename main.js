const Discord = require('discord.js')
const config = require('./config.json')
const pinyin = require('pinyin')
const request = require('request')
const client = new Discord.Client()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('!zh args')
})

client.on('message', message => {
    let channel = message.channel

    const args = message.content.slice(config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    if (command === 'pinyin' || command === 'zh') {
        if (!args.length) {
            channel.send(`You didn't provide any arguments, ${message.author}!`)
        } else {
            channel.send(pinyin(args.join()).join(' '))
        }
    } else if (command === "word" || command === "words") {
        if (!args.length) {
            channel.send(`You didn't provide any arguments, ${message.author}!`)
        } else {
            let options = {
                uri:
                    "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec"
                ,
                headers: {
                    "Content-type": "application/json",
                },
                json: {
                    "noun": "param1",
                    "pronunciation": "param2",
                    "meaning": "param3",
                    "example": "param4",
                    "time": "param5"
                }
            }
            request.post(options, function (error, response, body) { })
            channel.send(`args ${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]}`)
        }
    }
})

client.login(config.token)
