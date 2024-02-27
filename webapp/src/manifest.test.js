"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
test('Plugin manifest, id and version are defined', () => {
    expect(manifest_1.default).toBeDefined();
    expect(manifest_1.default.id).toBeDefined();
    expect(manifest_1.default.version).toBeDefined();
});
