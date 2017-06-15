"use strict";

const Moment = require("moment");
const MomentPreciseRange = require("moment-precise-range")(Moment);
const KOCString = require("koc-common-string");

const KOCDatetime = {
  /********************************
   * Valid 判断是否为有效时间
   ********************************/
  Valid: (Value) => {
    return !!KOCDatetime.Object(Value);
  },
  /********************************
   * Object 取得时间对像(Moment)
   ********************************/
  Object: (Value) => {
    if (Moment.isMoment(Value)) {
      return Value;
    }
    Value = Moment(Value, [
      Moment.ISO_8601,
      "YYYY-MM-DD HH:mm:ss.SSS",
      "YYYY/MM/DD HH:mm:ss.SSS",
      "YYYY.MM.DD HH:mm:ss.SSS",
      "YY-MM-DD HH:mm:ss.SSS",
      "YY/MM/DD HH:mm:ss.SSS",
      "YY.MM.DD HH:mm:ss.SSS"
    ]);
    return Value.isValid() ? Value : null;
  },
  /********************************
   * PreciseRange 取得时间差值
   ********************************/
  PreciseRange: (ValueBegin, ValueEnd) => {
    ValueBegin = KOCDatetime.Object(ValueBegin);
    if (!ValueBegin) {
      return null;
    }
    ValueEnd = KOCDatetime.Object(ValueEnd) || Moment();
    const Value = MomentPreciseRange(ValueBegin, ValueEnd, {returnObject: true});
    Value.After = ValueEnd.isAfter(ValueBegin);
    return Value;
  },
  /********************************
   * PreciseRangeText 取得时间差值文字
   ********************************/
  PreciseRangeText: (ValueBegin, ValueEnd, Num) => {
    if (typeof ValueEnd === "number") {
      Num = ValueEnd;
      ValueEnd = null;
    }
    const Value = KOCDatetime.PreciseRange(ValueBegin, ValueEnd);
    if (!Value) {
      return "";
    }
    Num = KOCString.ToInt(Num, -1);
    let Text = "";
    let Space = false;
    if (Num !== 0 && Value.years) {
      Text += Value.years + "年";
      Num--;
    }
    if (Num !== 0 && Value.months) {
      Text += Value.months + "个月";
      Num--;
    } else if (Text) {
      Num--;
      Space = true;
    }
    if (Num !== 0 && Value.days) {
      Text += (Space ? " 零 " : "") + Value.days + "天";
      Space = false;
      Num--;
    } else if (Text) {
      Num--;
      Space = true;
    }
    if (Num !== 0 && Value.hours) {
      Text += (Space ? " 零 " : "") + Value.hours + "小时";
      Space = false;
      Num--;
    } else if (Text) {
      Num--;
      Space = true;
    }
    if (Num !== 0 && Value.minutes) {
      Text += (Space ? " 零 " : "") + Value.minutes + "分";
      Space = false;
      Num--;
    } else if (Text) {
      Num--;
      Space = true;
    }
    if (Num !== 0 && Value.seconds) {
      Text += (Space ? " 零 " : "") + Value.seconds + "秒";
    }
    return Text ? (Text + " " + (Value.After ? "之前" : "以后")) : "刚刚";
  },
  /********************************
   * Min 取得最小时间(Moment)
   * Format     是否格式化 默认:true false:不格式化(输出Moment对像) true:格式化 其它:格式化格式
   ********************************/
  Min: (Value, Format) => {
    Value = KOCDatetime.Info(Value);
    if (!Value) {
      return null;
    }
    Value.month = Value.month > 0 ? Value.month : 1;
    Value.day = Value.day > 0 ? Value.day : 1;
    Value.hour = Value.hour >= 0 ? Value.hour : 0;
    Value.minute = Value.minute >= 0 ? Value.minute : 0;
    Value.second = Value.second >= 0 ? Value.second : 0;
    Value.millisecond = Value.millisecond >= 0 ? Value.millisecond : 0;
    Value = KOCDatetime.Object(Value.year + "-" + Value.month + "-" + Value.day + " " + Value.hour + ":" + Value.minute + ":" + Value.second + "." + Value.millisecond);
    if (Format !== false) {
      Value = Value.format(typeof Format === "string" ? Format : "YYYY-MM-DD HH:mm:ss.SSS");
    }
    return Value
  },
  /********************************
   * Max 取得最大时间(Moment)
   * Format     是否格式化 默认:true false:不格式化(输出Moment对像) true:格式化 其它:格式化格式
   ********************************/
  Max: (Value, Format) => {
    Value = KOCDatetime.Info(Value);
    if (!Value) {
      return null;
    }
    Value.month = Value.month > 0 ? Value.month : 12;
    Value.day = Value.day > 0 ? Value.day : KOCString.ToInt(KOCDatetime.Object(Value.year + "-" + Value.month).endOf("month").format("DD"));
    Value.hour = Value.hour >= 0 ? Value.hour : 23;
    Value.minute = Value.minute >= 0 ? Value.minute : 59;
    Value.second = Value.second >= 0 ? Value.second : 59;
    Value.millisecond = Value.millisecond >= 0 ? Value.millisecond : 999;
    Value = KOCDatetime.Object(Value.year + "-" + Value.month + "-" + Value.day + " " + Value.hour + ":" + Value.minute + ":" + Value.second + "." + Value.millisecond);
    if (Format !== false) {
      Value = Value.format(typeof Format === "string" ? Format : "YYYY-MM-DD HH:mm:ss.SSS");
    }
    return Value
  },
  /********************************
   * Info 取得时间详细信息
   ********************************/
  Info: (Value) => {
    if (!KOCDatetime.Valid(Value)) {
      return null;
    }
    const _Date = {
      year: -1,
      month: -1,
      day: -1,
      hour: -1,
      minute: -1,
      second: -1,
      millisecond: -1
    };
    Value = KOCString.ToString(Value).trim();
    Value = Value.split(Value.indexOf("T") > 0 ? "T" : " ");
    if (Value.length > 1) {
      const _ValueTime = Value[1].split(":");
      if (_ValueTime.length > 2) {
        const _ValueTimeSecond = _ValueTime[2].split(".");
        if (_ValueTimeSecond > 1) {
          _Date.millisecond = KOCString.ToInt(_ValueTimeSecond[1], -1);
        }
        _Date.second = KOCString.ToInt(_ValueTimeSecond[0], -1);
      }
      if (_ValueTime.length > 1) {
        _Date.minute = KOCString.ToInt(_ValueTime[1], -1);
      }
      _Date.hour = KOCString.ToInt(_ValueTime[0], -1);
    }
    let _ValueDate = [Value[0]];
    if (Value[0].indexOf("-") > 0) {
      _ValueDate = Value[0].split("-");
    } else if (Value[0].indexOf("/") > 0) {
      _ValueDate = Value[0].split("/");
    } else if (Value[0].indexOf(".") > 0) {
      _ValueDate = Value[0].split(".");
    }
    if (_ValueDate.length > 2) {
      _Date.day = KOCString.ToInt(_ValueDate[2], -1);
    }
    if (_ValueDate.length > 1) {
      _Date.month = KOCString.ToInt(_ValueDate[1], -1);
    }
    _Date.year = KOCString.ToInt(_ValueDate[0], -1);
    if (_Date.year < 0) {
      _Date.month = -1;
    }
    if (_Date.month <= 0) {
      _Date.day = -1;
    }
    if (_Date.day <= 0) {
      _Date.hour = -1;
    }
    if (_Date.day < 0) {
      _Date.minute = -1;
    }
    if (_Date.minute < 0) {
      _Date.second = -1;
    }
    if (_Date.second < 0) {
      _Date.millisecond = -1;
    }
    return _Date
  }
};

module.exports = KOCDatetime;