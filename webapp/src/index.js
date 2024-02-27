"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    async initialize(registry, store) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
    }
}
exports.default = Plugin;
window.registerPlugin(manifest_1.default.id, new Plugin());
