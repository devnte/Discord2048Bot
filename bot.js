var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

const filter = (reaction, user) => ['arrow_up', 'arrow_down', 'arrow_left', 'arrow_right'].includes(reaction.emoji.name) && user.id === message.author.id;

// Empty board
var board = [
    ['wall','wall','wall','wall','wall','wall'],
    ['wall',null,null,null,null,'wall'],
    ['wall',null,null,null,null,'wall'],
    ['wall',null,null,null,null,'wall'],
    ['wall',null,null,null,null,'wall'],
    ['wall','wall','wall','wall','wall','wall']
];

// Dictionary used to store all of the boards on a channelID basis. I will attempt to store on a per server basis as I continue
var boardDic = {
    "testID": board
};



//Prints the board for the message to be posted into discord

function printBoard(b){
    var m = "|";
    for (i = 1; i < 5; i++){
        for(j = 1; j < 5; j++){
            if (b[i][j] == null){
                m += "  |";
            }
            else{
                m += b[i][j].toString() + "|";
            }
        }
        m += "\n" + "|";
    }
    return m.slice(0,m.length-1);
}

//Identify all empty spots on the board, fill one of them with a 2 or a 4
function addItem(b){
    var opens = [];
    for (i = 1; i < 5; i++){
        for(j = 1; j < 5; j++){
            if (b[i][j] == null){
                opens.push([i,j]);
            }
    }
}
    var choices = [2,2,4];
    var choice = choices[Math.floor(Math.random()*choices.length)];
    var open = opens[Math.floor(Math.random()*opens.length)];
    b[open[0]][open[1]] = choice;  
}

// Instantiate a new Board and fill two slots with either a 2 or a 4
function makeBoard(){
    var b = [
        ['wall','wall','wall','wall','wall','wall'],
        ['wall',null,null,null,null,'wall'],
        ['wall',null,null,null,null,'wall'],
        ['wall',null,null,null,null,'wall'],
        ['wall',null,null,null,null,'wall'],
        ['wall','wall','wall','wall','wall','wall']
    ];
    addItem(b);
    addItem(b);
    return b;
}

// All current tiles will slide in the specified direction until encountering the wall or another tile
// If two tiles collide and are the same value, they will add up and slide to the furthest tile in that direction before colliding

function slide(b, dir){
    if (dir == "left"){
        var merged = [];
        for (i = 1; i < 5; i ++){
            for (j = 1; j < 5; j ++){
                if (b[i][j] != null){
                    var x = j;
                    var y = i;
                    var val = b[i][j]
                    while (b[i][x-1] == null){
                        x -=1;
                    }
                    if((b[i][x-1] == val) && !([i, x-1] in merged)){
                        merged.push([i,x-1]);
                        x -= 1;
                        val = val * 2;
                    }
                    b[i][j] = null;
                    b[i][x] = val;
                }
            }
        }
    }
    if (dir == "right"){
        var merged = [];
        for (i = 1; i < 5; i++){
            for (j = 4; j > 0; j--){
                if (b[i][j] != null){
                    var x = j;
                    var y = i;
                    var val = b[i][j]
                    while (b[i][x+1] == null){
                        x +=1;
                    }
                    if((b[i][x+1] == val) && !([i, x+1] in merged)){
                        merged.push([i,x+1]);
                        x += 1;
                        val = val * 2;
                    }
                    b[i][j] = null;
                    b[i][x] = val;
                }
            }
        }
    }
    if (dir == "down"){
        var merged = [];
        for (i = 1; i < 5; i++){
            for (j = 4; j > 0; j--){
                if (b[i][j] != null){
                    var x = j;
                    var y = i;
                    var val = b[i][j]
                    while (b[y+1][j] == null){
                        y +=1;
                    }
                    if((b[y+1][j] == val) && !([y+1, j] in merged)){
                        merged.push([y+1,j]);
                        y += 1;
                        val = val * 2;
                    }
                    b[i][j] = null;
                    b[y][j] = val;
                }
            }
        }
    }
    if (dir == "up"){
        var merged = [];
        for (i = 1; i < 5; i ++){
            for (j = 1; j < 5; j ++){
                if (b[i][j] != null){
                    var x = j;
                    var y = i;
                    var val = b[i][j]
                    while (b[y-1][j] == null){
                        y -=1;
                    }
                    if((b[y-1][j] == val) && !([y-1, j] in merged)){
                        merged.push([y-1,j]);
                        y -= 1;
                        val = val * 2;
                    }
                    b[i][j] = null;
                    b[y][j] = val;
                }
            }
        }
    }
    addItem(b);
}
client.on('messageReactionAdd', (reaction, user) => {
	console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
});

client.on('messageReactionRemove', (reaction, user) => {
	console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: user
                });
                break;
            // Creates a new board. Will override stored board if needed.
            case 'new':
                if (channelID in boardDic){
                   boardDic[channelID] = makeBoard();
                   bot.sendMessage({
                    to: channelID,
                    message: printBoard(boardDic[channelID])
                   })
                }
                else{
                    boardDic[channelID] = makeBoard();
                    bot.sendMessage({
                        to: channelID,
                        message: printBoard(boardDic[channelID])
                       })
                }
                break;
            // Displays the current board as a post in discord.
            // If no board, suggest using the !new command
            case 'board':
                if (boardDic[channelID]){
                    bot.sendMessage({
                        to: channelID,
                        message: printBoard(boardDic[channelID])
                    });
                }
                else{
                    bot.sendMessage({
                        to:channelID,
                        message: "You have not yet created a board in this channel yet. Please use the 'new' command to do so!"
                    });
                }    

                 break;

                 case 'slideL':
                 if (channelID in boardDic){
                     slide(boardDic[channelID],"left");
                     bot.sendMessage({
                         to: channelID,
                         message: printBoard(boardDic[channelID])
                     });
                 }
                 else{
                     bot.sendMessage({
                         to:channelID,
                         message: "You have not yet created a board in this channel yet. Please use the 'new' command to do so!"
                     });
                 }    
 
                  break;

                 case 'slideR':
                 if (channelID in boardDic){
                     slide(boardDic[channelID],"right");
                     bot.sendMessage({
                         to: channelID,
                         message: printBoard(boardDic[channelID])
                     });
                 }
                 else{
                     bot.sendMessage({
                         to:channelID,
                         message: "You have not yet created a board in this channel yet. Please use the 'new' command to do so!"
                     });
                 }    
 
                  break;

                  case 'slideD':
                  if (channelID in boardDic){
                      slide(boardDic[channelID],"down");
                      bot.sendMessage({
                          to: channelID,
                          message: printBoard(boardDic[channelID])
                      });
                  }
                  else{
                      bot.sendMessage({
                          to:channelID,
                          message: "You have not yet created a board in this channel yet. Please use the 'new' command to do so!"
                      });
                  }    
  
                   break;
                
                  case 'slideU':
                  if (channelID in boardDic){
                      slide(boardDic[channelID],"up");
                      bot.sendMessage({
                          to: channelID,
                          message: printBoard(boardDic[channelID])
                      });
                  }
                  else{
                      bot.sendMessage({
                          to:channelID,
                          message: "You have not yet created a board in this channel yet. Please use the 'new' command to do so!"
                      });
                  }    
  
                   break;
         }
     }
});