"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingFrequency = exports.MeterType = void 0;
// Legacy enum - kept for backward compatibility during migration
var MeterType;
(function (MeterType) {
    MeterType["WATER"] = "WATER";
    MeterType["ELECTRIC"] = "ELECTRIC";
})(MeterType || (exports.MeterType = MeterType = {}));
var ReadingFrequency;
(function (ReadingFrequency) {
    ReadingFrequency["DAILY"] = "DAILY";
    ReadingFrequency["WEEKLY"] = "WEEKLY";
    ReadingFrequency["MONTHLY"] = "MONTHLY";
    ReadingFrequency["AD_HOC"] = "AD_HOC";
})(ReadingFrequency || (exports.ReadingFrequency = ReadingFrequency = {}));
//# sourceMappingURL=meter.types.js.map