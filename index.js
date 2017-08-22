"use strict";

/* C */
var Moment = require("moment");
/* C */
var KOCString = require("koc-common-string");

/* C */
var KOCDatetime = {
  Moment: Moment,
  /********************************
   * Valid 判断是否为有效时间
   ********************************/
  Valid: function (Value) {
    return !!KOCDatetime.Object(Value);
  },
  /********************************
   * Object 取得时间对像(Moment)
   ********************************/
  Object: function (Value) {
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
  PreciseRange: function (ValueBegin, ValueEnd) {
    ValueBegin = KOCDatetime.Object(ValueBegin);
    if (!ValueBegin) {
      return null;
    }
    ValueEnd = KOCDatetime.Object(ValueEnd) || Moment();
    /* L */
    var IsAfter = true;
    if (ValueBegin.isAfter(ValueEnd)) {
      /* C */
      var tmp = ValueBegin;
      ValueBegin = ValueEnd;
      ValueEnd = tmp;
      IsAfter = false;
    }
    /* L */
    var yDiff = ValueEnd.year() - ValueBegin.year();
    /* L */
    var mDiff = ValueEnd.month() - ValueBegin.month();
    /* L */
    var dDiff = ValueEnd.date() - ValueBegin.date();
    /* L */
    var hourDiff = ValueEnd.hour() - ValueBegin.hour();
    /* L */
    var minDiff = ValueEnd.minute() - ValueBegin.minute();
    /* L */
    var secDiff = ValueEnd.second() - ValueBegin.second();
    if (secDiff < 0) {
      secDiff = 60 + secDiff;
      minDiff--;
    }
    if (minDiff < 0) {
      minDiff = 60 + minDiff;
      hourDiff--;
    }
    if (hourDiff < 0) {
      hourDiff = 24 + hourDiff;
      dDiff--;
    }
    if (dDiff < 0) {
      /* C */
      var daysInLastFullMonth = Moment(ValueEnd.year() + '-' + (ValueEnd.month() + 1), "YYYY-MM").subtract(1, 'months').daysInMonth();
      if (daysInLastFullMonth < ValueBegin.date()) { // 31/01 -> 2/03
        dDiff = daysInLastFullMonth + dDiff + (ValueBegin.date() - daysInLastFullMonth);
      } else {
        dDiff = daysInLastFullMonth + dDiff;
      }
      mDiff--;
    }
    if (mDiff < 0) {
      mDiff = 12 + mDiff;
      yDiff--;
    }
    return {
      Years: Moment.duration(yDiff, 'year').asYears(),
      Months: Moment.duration(mDiff, 'month').asMonths(),
      Days: Moment.duration(dDiff, 'day').asDays(),
      Hours: Moment.duration(hourDiff, 'hour').asHours(),
      Minutes: Moment.duration(minDiff, 'minute').asMinutes(),
      Seconds: Moment.duration(secDiff, 'second').asSeconds(),
      After: IsAfter
    };
  },
  /********************************
   * PreciseRangeText 取得时间差值文字
   ********************************/
  PreciseRangeText: function (ValueBegin, ValueEnd, Num) {
    if (typeof ValueEnd === "number") {
      Num = ValueEnd;
      ValueEnd = null;
    }
    /* C */
    var Value = KOCDatetime.PreciseRange(ValueBegin, ValueEnd);
    if (!Value) {
      return "";
    }
    Num = KOCString.ToInt(Num, -1);
    /* L */
    var Text = "";
    /* L */
    var Space = false;
    if (Num !== 0 && Value.Years) {
      Text += Value.Years + "年";
      Num--;
    }
    if (Num !== 0) {
      if (Value.Months) {
        Text += Value.Months + "个月";
        Num--;
      } else if (Text) {
        Space = true;
        Num--;
      }
    }
    if (Num !== 0) {
      if (Value.Days) {
        Text += (Space ? " 零 " : "") + Value.Days + "天";
        Space = false;
        Num--;
      } else if (Text) {
        Space = true;
        Num--;
      }
    }
    if (Num !== 0) {
      if (Value.Hours) {
        Text += (Space ? " 零 " : "") + Value.Hours + "小时";
        Space = false;
        Num--;
      } else if (Text) {
        Space = true;
        Num--;
      }
    }
    if (Num !== 0) {
      if (Value.Minutes) {
        Text += (Space ? " 零 " : "") + Value.Minutes + "分";
        Space = false;
        Num--;
      } else if (Text) {
        Space = true;
        Num--;
      }
    }
    if (Num !== 0 && Value.Seconds) {
      Text += (Space ? " 零 " : "") + Value.Seconds + "秒";
    }
    return Text ? (Text + " " + (Value.After ? "以前" : "以后")) : "刚刚";
  },
  /********************************
   * Min 取得最小时间(Moment)
   * Format     是否格式化 默认:true false:不格式化(输出Moment对像) true:格式化 其它:格式化格式
   ********************************/
  Min: function (Value, Format) {
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
  Max: function (Value, Format) {
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
  Info: function (Value) {
    if (!KOCDatetime.Valid(Value)) {
      return null;
    }
    /* C */
    var _Date = {
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
      /* C */
      var _ValueTime = Value[1].split(":");
      if (_ValueTime.length > 2) {
        /* C */
        var _ValueTimeSecond = _ValueTime[2].split(".");
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
    /* L */
    var _ValueDate = [Value[0]];
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