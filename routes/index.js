var _ = require('underscore'),
    mongoose = require('mongoose'),
    flow = require('flow'),
    path = require('path'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.connect('mongodb://hbladmin:qweqweqwe@ds039088.mongolab.com:39088/hbl');

var GameSchema = new Schema({
    "Date": String,
    "GameId": Number,
    "No": Number,
    "Referee": String,
    "Official_1": String,
    "Official_2": String,
    "TeamA": String,
    "TeamB": String,
    "Score_quarters_1": String,
    "Score_quarters_2": String,
    "Score_quarters_3": String,
    "Score_quarters_4": String,
    "Woman": Boolean
}),
    RecordSchema = new Schema({
        "number": Number,
        "teamName": String,
        "position": String,
        "name": String,
        "game_start": Boolean,
        "three_points_made": Number,
        "three_points_misses": Number,
        "field_goals_made": Number,
        "field_goal_misses": Number,
        "free_throws_made": Number,
        "free_throw_misses": Number,
        "points": Number,
        "offensive_rebounds": Number,
        "defensive_rebounds": Number,
        "assists": Number,
        "steals": Number,
        "blocks": Number,
        "turnovers": Number,
        "fouls": Number,
        "minutes_played": Number,
        "other": String,
        "gameId": Number
    });
var Game = mongoose.model('Game', GameSchema),
    Record = mongoose.model('Record', RecordSchema);

exports.index = function(req, res) {
    res.render('index', {
        title: ''
    });
};
exports.test = function(req, res) {
    Game.find({
        Woman: false
    });
    Games.allDocs({
        include_docs: true
    }, function(er, r) {
        res.json(r);
    });
};
exports.games = function(req, res, next) {
    var gender = req.params.gender,
        isFemale = gender === 'female';
    Game.find({
        'Woman': isFemale
    }).sort({
        'GameId': 1
    }).execFind(

    function(err, results) {
        if(err) next(err);
        res.render('games', {
            title: isFemale ? '女籃場次' : '男籃場次',
            games: results
        });
    });
};
exports.allGames = function(req, res, next) {
    Game.find({}).sort({
        'GameId': 1
    }).execFind(

    function(err, results) {
        if(err) next(err);
        res.render('games', {
            title: '全部場次',
            games: results
        });
    });
};
exports.game = function(req, res) {
    var gid = req.params.gid;
    Game.findOne({
        GameId : gid
    },function (err, game){
        Record.find({
            "gameId": parseInt(gid, 0)
        }, function(err, results) {
            res.render('game', {
                title: "單場記錄",
                game: game,
                records: results
            });
        });
    });
    
};