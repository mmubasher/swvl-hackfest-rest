'use strict';
const BaseUtility = require('./base');
module.exports = class TimeUtility extends BaseUtility {

    static currentTimeUTC() {
        var dt = new Date().toISOString().replace(/T/, ' '). // replace T with a space
                replace(/\..+/, ''); // delete the dot and everything after
        return dt;
    }

    static earlyTimeUTC(seconds) {
        let currentTimeInMilli = Date.now();
        let earlyTime = currentTimeInMilli - (seconds * 1000);
        let earlyUTCTime = new Date(earlyTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        return earlyUTCTime;
    }

    static earlyTimeUTCWithoutReplacement(seconds) {
        let currentTimeInMilli = Date.now();
        let earlyTime = currentTimeInMilli - (seconds * 1000);
        let earlyUTCTime = new Date(earlyTime).toISOString();
        return earlyUTCTime;
    }

    static getTodaysDateString() {
        var dt = new Date().toISOString().replace(/T.+/, '');
        return dt;
    }

    static todaysDate() {
        const currentDate = new Date();
        const todaysDate = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
        //console.log(todaysDate);
        return todaysDate;
    }

    static getPreviousDateTime(n) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - n);
        return currentDate;
    }

    /**
     *
     * @param {*} time | Db value in UTC
     */
    static isTodayDate(time) {
        const inputDateTime = new Date(time);
        const inputDate = Date.UTC(inputDateTime.getUTCFullYear(), inputDateTime.getUTCMonth(), inputDateTime.getUTCDate());
        const todaysDate = TimeUtility.todaysDate();
        if ((todaysDate - inputDate)==0) {
            return true;
        }
        return false;
    }

    static numberOfDaysPassed(time) {
        let referenceDate = new Date(time);
        let currentDate = new Date();
        let endDate = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
        let startDate = Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate());
        let nDays = Math.round(Math.abs(endDate - startDate) / 86400000);
        return nDays;
    }

}
