"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var Postgres = /** @class */ (function () {
    function Postgres(config) {
        this._workingQueries = [];
        this._promises = [];
        var password = config.password;
        var database = config.database;
        var user = config.user ? config.user : 'postgres';
        var host = config.host ? config.host : 'localhost';
        var port = config.port ? config.port : '5432';
        this._process = (0, child_process_1.spawn)("".concat(process.env.PSQL_PATH, " postgresql://").concat(user, ":").concat(password, "@").concat(host, ":").concat(port, "/").concat(database), [], { shell: true });
    }
    Postgres.prototype.query = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var queryObj;
            var _this = this;
            return __generator(this, function (_a) {
                if (this._workingQueries.length >= 1) {
                    queryObj = this._workingQueries[this._workingQueries.length - 1];
                    queryObj.onReady = function () { _this._query(query).then(function (data) { return resolve(data); }).catch(function (err) { return reject(err); }); };
                }
                else
                    this._query(query).then(function (data) { return resolve(data); }).catch(function (err) { return reject(err); });
                return [2 /*return*/];
            });
        }); });
    };
    Postgres.prototype.parseData = function (data) {
        var rows = [];
        var result = data.toString().split('\n');
        var tableColumns = result[0].split('|');
        tableColumns = tableColumns.map(function (column) { return column.trim(); });
        var _loop_1 = function (i) {
            var columns = result[i].split('|');
            if (result[i].startsWith('('))
                return out_i_1 = i, "break";
            var obj = {};
            var flag = false;
            columns.forEach(function (column, index) {
                obj[tableColumns[index]] = column.trim();
                if (obj[tableColumns[index]].endsWith('+'))
                    flag = true;
            });
            if (flag) {
                flag = false;
                i++;
                columns = result[i].split('|');
                columns.forEach(function (column, index) {
                    var str = obj[tableColumns[index]];
                    if (str.endsWith('+'))
                        str = str.substring(0, str.length - 1);
                    str += column.trim();
                    obj[tableColumns[index]] = str.trim();
                });
            }
            rows.push(obj);
            out_i_1 = i;
        };
        var out_i_1;
        for (var i = 2; i < result.length; i++) {
            var state_1 = _loop_1(i);
            i = out_i_1;
            if (state_1 === "break")
                break;
        }
        return rows;
    };
    Postgres.prototype._query = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var queryId = _this._workingQueries.length === 0 ? 1 : _this._workingQueries[_this._workingQueries.length - 1].id + 1;
            var queryObj = {
                id: queryId
            };
            _this._workingQueries.push(queryObj);
            _this._process.stdin.write("".concat(query, ";\n"));
            var procOnData = onData.bind({ process: _this, id: queryId });
            _this._process.stdout.on('data', procOnData);
            _this._process.stdout.on('error', function (data) {
                reject(new Error("Error: ".concat(data.toString())));
            });
            var procOnError = onError.bind({ process: _this, id: queryId });
            _this._process.stderr.on('data', procOnError);
            var cleanup = function (id) {
                _this._process.stdout.off('data', procOnData);
                _this._process.stderr.off('data', procOnError);
                _this._workingQueries.forEach(function (elem, index) {
                    if (elem.id === id)
                        _this._workingQueries.splice(index, 1);
                });
            };
            function onData(data) {
                var rows = this.process.parseData(data);
                cleanup(this.id);
                if (queryObj.onReady)
                    queryObj.onReady();
                resolve(rows);
            }
            function onError(data) {
                if (queryId !== this.id)
                    return;
                var err = new Error('Database Error: ' + data.toString());
                cleanup(this.id);
                reject(err);
            }
        });
    };
    return Postgres;
}());
exports.default = Postgres;
