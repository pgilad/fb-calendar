'use strict';
/* global describe, it, before*/

// force the test environment to 'test'
process.env.NODE_ENV = 'test';
// get the application server module
var connect = require('connect');
var serveStatic = require('serve-static');
var Browser = require('zombie');

var PORT = process.env.PORT || 8080;

describe('fb-calendar', function () {
    before(function (done) {
        connect().use(serveStatic('./dist')).listen(PORT);
        this.browser = new Browser({
            site: 'http://localhost:' + PORT
        });
        this.browser.visit('/', done);
    });

    it('should make sure elements are intact', function () {
        var browser = this.browser;
        browser.assert.status(200);
        browser.assert.element('head');
        browser.assert.element('body');
    });

    it('should detect calendar containers', function () {
        var browser = this.browser;
        browser.assert.element('.calendar-container');
        browser.assert.element('.calendar-container .calendar-events');
        browser.assert.element('.calendar-container .calendar-time');
    });

    it('should make sure event calendar is styled right', function () {
        var browser = this.browser;
        browser.assert.style('.calendar-events', 'margin-top', '15px');
        browser.assert.style('.calendar-events', 'height', '720px');
        browser.assert.style('.calendar-events', 'width', '600px');
    });

    it('should make sure time is filled', function () {
        var browser = this.browser;
        browser.assert.evaluate('$(".calendar-time").children().length', 25);
    });

    it('should make initial events are displayed right', function () {
        var browser = this.browser;
        browser.assert.elements('.calendar-events .inner .event', 4);
    });

    function checkEventsSanity(browser) {
        var str = '$(".event").each(function() { if (!this.clientWidth || !this.clientHeight || this.clientWidth + this.clientLeft > 600) { throw new Error("bad event", this); }});';
        browser.evaluate(str, 1);
    }

    it('should make app globals are exposed', function () {
        var browser = this.browser;
        browser.assert.global('app');
        browser.assert.global('layOutDay');
    });

    it('should run a sanity check on event sizes', function () {
        checkEventsSanity(this.browser);
    });

    it('should run sanity check against lots of random data', function () {
        //really long test
        this.timeout(10000);
        var browser = this.browser;
        for (var i = 0; i < 100; ++i) {
            browser.assert.evaluate('window.app.layOutDay(app.generateRandom())');
            browser.wait(100);
            checkEventsSanity(this.browser);
            browser.wait(100);
        }
    });
});
