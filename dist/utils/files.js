"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var cwd_1 = __importDefault(require("cwd"));
var glob_1 = __importDefault(require("glob"));
var constants_1 = require("./constants");
var parsers_1 = require("./parsers");
var common_tags_1 = require("common-tags");
var versioning_1 = require("./versioning");
exports.getConfig = function () {
    var configPath = path_1.default.join(constants_1.Directories.Root, constants_1.Filenames.Config);
    var defaultConfig = {
        migrationsDir: constants_1.Directories.Migrations,
        environments: {},
        currentEnvironment: constants_1.Environments.Default
    };
    if (fs_1.default.existsSync(configPath)) {
        var config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        return config;
    }
    else
        return defaultConfig;
};
exports.writeToConfig = function (config) {
    var configPath = path_1.default.join(constants_1.Directories.Root, constants_1.Filenames.Config);
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 4));
};
exports.writeToGitIgnore = function () {
    var gitIgnorePath = path_1.default.join(constants_1.Directories.Root, constants_1.Filenames.GitIgnore);
    fs_1.default.writeFileSync(gitIgnorePath, common_tags_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        wrconfig.json\n        wrhistory.json\n    "], ["\n        wrconfig.json\n        wrhistory.json\n    "]))));
};
exports.getHistory = function () {
    var historyPath = path_1.default.join(constants_1.Directories.Root, constants_1.Filenames.History);
    var config = exports.getConfig();
    var defaultHistory = {
        committed: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        latestError: null
    };
    if (fs_1.default.existsSync(historyPath)) {
        var history = JSON.parse(fs_1.default.readFileSync(historyPath, 'utf8'));
        var environmentHistory = history[config.currentEnvironment];
        if (typeof environmentHistory === 'undefined') {
            return defaultHistory;
        }
        else
            return environmentHistory;
    }
    else
        return defaultHistory;
};
exports.writeToHistory = function (environmentHistory) {
    var historyPath = path_1.default.join(constants_1.Directories.Root, constants_1.Filenames.History);
    var config = exports.getConfig();
    var history = {};
    if (fs_1.default.existsSync(historyPath)) {
        history = JSON.parse(fs_1.default.readFileSync(historyPath, 'utf8'));
    }
    history[config.currentEnvironment] = environmentHistory;
    fs_1.default.writeFileSync(historyPath, JSON.stringify(history, null, 4));
};
exports.getPendingMigrations = function (dir) {
    var migrations = [];
    var history = exports.getHistory();
    var committedMigrations = history.committed;
    var filenames = glob_1.default.sync(path_1.default.join(dir, '/v*_*_*__*.js'));
    filenames = filenames.filter(function (filename) { return !committedMigrations.includes(parsers_1.extractVersion(dir, filename).standard); })
        .sort(function (prev, curr) {
        var vPrev = prev.split('/')[1];
        var vCurr = curr.split('/')[1];
        return versioning_1.compareVersions(versioning_1.parseVersionParts(vCurr), versioning_1.parseVersionParts(vPrev));
    });
    for (var _i = 0, filenames_1 = filenames; _i < filenames_1.length; _i++) {
        var filename = filenames_1[_i];
        var migration = require(cwd_1.default(filename));
        migrations.push(migration);
    }
    return migrations;
};
exports.getLatestMigrations = function (dir, count) {
    var migrations = [];
    var history = exports.getHistory();
    var migrationCount = count || history.committed.length;
    var latestMigrations = history.committed.slice().reverse().slice(0, migrationCount);
    var filenames = glob_1.default.sync(path_1.default.join(dir, '/v*_*_*__*.js'));
    filenames = filenames.filter(function (filename) { return latestMigrations.includes(parsers_1.extractVersion(dir, filename).standard); })
        .sort(function (prev, curr) {
        var vPrev = prev.split('/')[1];
        var vCurr = curr.split('/')[1];
        return versioning_1.compareVersions(versioning_1.parseVersionParts(vCurr), versioning_1.parseVersionParts(vPrev));
    })
        .slice()
        .reverse()
        .slice();
    console.log('FILE', filenames);
    for (var _i = 0, filenames_2 = filenames; _i < filenames_2.length; _i++) {
        var filename = filenames_2[_i];
        var migration = require(cwd_1.default(filename));
        migrations.push(migration);
    }
    return migrations;
};
var templateObject_1;
//# sourceMappingURL=files.js.map