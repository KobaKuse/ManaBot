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
            channel.send(`You didn't provide any arguments.`)
        } else {
            channel.send(pinyin(args.join()).join(' '))
        }
    } else if (command === "word" || command === "words") {
        if (!args.length) {
            channel.send(`You didn't provide any arguments.`)
        } else if (args[0]) {
            let options = {
                uri:
                    "https://script.google.com/macros/s/AKfycbz4FSe6iSlsQBfIBORc2DjkFQCy9_9vjbj4hgzc/exec"
                ,
                headers: {
                    "Content-type": "application/json",
                },
                json: {
                    "noun": args[0],
                    "pronunciation": args[1],
                    "meaning": args[2],
                    "example": args[3],
                    "time": getNowYMD()
                }
            }
            request.post(options, function (error, response, body) { })
            channel.send(`args ${args[0]} ${args[1]} ${args[2]} ${args[3]} `, getNowYMD())
        }
    }
})

client.login(config.token)

function getNowYMD() {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth() + 1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "/" + m + "/" + d;
    return result;
}