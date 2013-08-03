/*
 * Taiwan High School Basketball League (HBL) Records
 * https://github.com/flyworld/Taiwan-HBL-Records
 *
 * Copyright (c) 2013 Ryan Wu
 * Licensed under the MIT license.
 */

var _s = require('underscore.string'),
    fs = require('fs'),
    nStore = require('nstore'),
    moment = require('moment'),
    flow = require('flow'),
    flow2 = require('flow'),
    cheerio = require('cheerio'),
    path = require('path'),
    htmlLocation = path.resolve(__dirname, '..', 'pages'),
    htmlFiles = fs.readdirSync(htmlLocation);

var Games = nStore['new'](path.resolve(__dirname, '..', 'db', 'games.db'));
var Records = nStore['new'](path.resolve(__dirname, '..', 'db', 'records.db'));


var parseMetaScore = function(scoreMeta) {
        var score = scoreMeta.split(' ')[1];
        return score;
    },
    parseMetaDate = function(dateMeta) {
        var rawText = dateMeta.substring(2, dateMeta.length),
            afterY = rawText.split('年'),
            year = afterY[0],
            afterM = afterY[1].split('月'),
            month = afterM[0],
            afterD = afterM[1].split('日'),
            date = afterD[0];
        var gameDate = moment();
        gameDate.year(parseInt(year, 0) + 1911);
        gameDate.month(parseInt(month - 1, 0)); //Accepts numbers from 0 to 11
        gameDate.date(parseInt(date, 0));
        return gameDate.format('YYYY-MM-DD');
    },
    parseMetaTable = function($, metaTable, gameId, cb) {
        var metaTDs = metaTable.find('td'),
            teams = $(metaTDs[11]).text().split(':');
        Games.save(parseInt(gameId, 0), {
            'Date : ': parseMetaDate($(metaTDs[1]).text()),
            'No : ': parseInt($(metaTDs[3]).text(), 0),
            'Referee : ': _s.trim($(metaTDs[5]).text()),
            'Check1 : ': _s.trim($(metaTDs[13]).text()),
            'Check2 : ': _s.trim($(metaTDs[15]).text()),
            'TeamA : ': _s.trim(teams[0]),
            'TeamB : ': _s.trim(teams[1]),
            'Score_quarters_1: ': parseMetaScore($(metaTDs[7]).text()),
            'Score_quarters_2: ': parseMetaScore($(metaTDs[9]).text()),
            'Score_quarters_3: ': parseMetaScore($(metaTDs[17]).text()),
            'Score_quarters_4: ': parseMetaScore($(metaTDs[19]).text())
        }, function(err) {
            if(err) {
                throw err;
            }
            console.dir('Game ' + gameId + ' saved!');
            cb();
        });

        // for (var i = metaTDs.length; i--;) {
        //     var td = metaTDs[i];
        //     console.dir($(td).text());
        // }
    },
    parsePlayer = function($, teamDataTable, teamName, gameId, cb) {
        var playerTRsObject = teamDataTable.find('tr'),
            playerTRs = playerTRsObject.toArray();
        playerTRs.pop();
        playerTRs.shift();
        playerTRs.shift();
        // 1.控球(1號位置)
        // 2.後衛(2號位置)
        // 3.小前鋒(3號位置)
        // 4.大前鋒(4號位置)
        // 5.中鋒(5號位置)
        flow.exec(function() {
            var that = this;
            for(var i = 0; i < playerTRs.length; i++) {
                var tr = playerTRs[i],
                    playerTDs = $(tr).find('td font'),
                    number = parseInt($(playerTDs).eq(0).text(), 0);
                var record = {
                    number: number,
                    position: _s.trim($(playerTDs).eq(1).text()),
                    name: _s.trim($(playerTDs).eq(2).text()),
                    game_start: $(playerTDs).eq(3).text() === '是' ? true : false,
                    three_points: parseInt($(playerTDs).eq(4).text(), 0),
                    three_points_attempts: parseInt($(playerTDs).eq(5).text(), 0),
                    field_goals: parseInt($(playerTDs).eq(6).text(), 0),
                    field_goal_attempts: parseInt($(playerTDs).eq(7).text(), 0),
                    free_throws: parseInt($(playerTDs).eq(8).text(), 0),
                    free_throw_attempts: parseInt($(playerTDs).eq(9).text(), 0),
                    points: parseInt($(playerTDs).eq(10).text(), 0),
                    offensive_rebounds: parseInt($(playerTDs).eq(11).text(), 0),
                    defensive_rebounds: parseInt($(playerTDs).eq(12).text(), 0),
                    assists: parseInt($(playerTDs).eq(13).text(), 0),
                    steals: parseInt($(playerTDs).eq(14).text(), 0),
                    blocks: parseInt($(playerTDs).eq(15).text(), 0),
                    turnovers: parseInt($(playerTDs).eq(16).text(), 0),
                    fouls: parseInt($(playerTDs).eq(17).text(), 0),
                    minutes_player: parseInt($(playerTDs).eq(18).text(), 0),
                    other: _s.trim($(playerTDs).eq(19).text()),
                    gameId: parseInt(gameId, 0)
                };
                Records.save(null, record, that.MULTI());
            }
        }, function() {
            if(cb) {
                cb();
            }
        });
    },
    readHtml = function(fileName, cb) {
        var filePath = path.resolve(htmlLocation, fileName),
            baseFn = fileName.split('=')[3];
        if(!baseFn) {
            if(cb) {
                cb();
            }
            return;
        }

        var gameId = baseFn.replace('.html', '');
        console.dir('Parsing : ' + gameId);
        fs.readFile(filePath, 'utf-8', function(err, data) {
            if(err) {
                throw err;
            }
            var $ = cheerio.load(data);
            var metaTable = $('table').eq(0),
                team1Table = $('table').eq(1).find('td').eq(1),
                team1DataTable = $('table').eq(2),
                team2Table = $('table').eq(3),
                team2DataTable = $('table').eq(4);
            parsePlayer($, team1DataTable, _s.trim(team1Table.text()), gameId, null);
            parsePlayer($, team2DataTable, _s.trim(team2Table.text()), gameId, null);
            parseMetaTable($, metaTable, gameId, cb);
        });
    };
// Single Game Data
// var f = htmlFiles[424];
// readHtml(f);
// Game Data
flow2.serialForEach(htmlFiles, function(htmlFile) {
    readHtml(htmlFile, this);
});