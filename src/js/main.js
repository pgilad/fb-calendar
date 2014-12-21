'use strict';
/* global $ */

var config = (function () {
    var _config = {
        // define how many hours we want to display
        hours: 12,
        // how many minor ticks will be a major
        majorTimeTick: 2,
        // how many ticks to show per hour
        ticksPerHour: 2,
        // what time does the day start
        startTime: 9,
        // minutes per hour (for those living in mars)
        minutesPerHour: 60,
        // container height in px
        containerHeight: 720,
        // container weight in px without padding
        containerWidth: 600,
        // units to display container with
        containerUnits: 'px'
    };
    // height of every time tick
    _config.tickHeight = Math.round(_config.containerHeight / _config.hours / _config.ticksPerHour);
    // margin of the events container to match exactly center of the time ticks
    _config.containerMarginTop = Math.round(_config.tickHeight / 2);
    _config.minuteHeight = _config.containerHeight / _config.hours / _config.minutesPerHour;
    return _config;
})();

function getPrettyTime(time) {
    var hours = Math.floor(time);
    // return time using the American system
    return {
        hours: hours > 12 ? hours - 12 : hours,
        minutes: time % 1 * config.minutesPerHour
    };
}

function getAmPm(time) {
    return time < 12 ? 'AM' : 'PM';
}

function getPaddedMinutes(minutes) {
    return minutes < 10 ? '0' + minutes : minutes;
}

function getRenderedTime(time) {
    var prettyTime = getPrettyTime(time);
    var paddedMinutes = getPaddedMinutes(prettyTime.minutes);
    return prettyTime.hours + ':' + paddedMinutes;
}

function getRenderedMinorTick(time) {
    var renderedTime = getRenderedTime(time);
    return '<div class="time-tick"><span class="minor">' +
        renderedTime +
        '</span></div>';
}

function getRenderedMajorTick(time) {
    var renderedTime = getRenderedTime(time);
    var amPm = getAmPm(time);
    return '<div class="time-tick"><span class="major">' +
        renderedTime +
        '</span><span class="minor">' +
        amPm +
        '</span></div>';
}

var $container = $('.day-view');
var $time = $container.find('.calendar-time');
var $events = $container.find('.calendar-events');

function setupDay() {
    $events.css({
        height: config.containerHeight + config.containerUnits,
        width: config.containerWidth + config.containerUnits,
        marginTop: config.containerMarginTop + config.containerUnits
    });

    var startTime = config.startTime;
    // also display the last hour
    var endTime = (config.hours * config.ticksPerHour) + 1;
    var timeHtml = [];
    var time;
    for (var i = 0; i < endTime; ++i) {
        time = startTime + (i / config.ticksPerHour);
        var isMajorTick = i % config.majorTimeTick === 0;
        var tickHtml;
        tickHtml = isMajorTick ? getRenderedMajorTick(time) : getRenderedMinorTick(time);
        timeHtml.push(tickHtml);
    }
    $time.html(timeHtml);
    // container is ready now
    $container.show();
}

// scale events to fit in our container
function getEventHeight(event) {
    //TODO: think about minimum display time (if event is too thin)
    var diff = event.end - event.start;
    return Math.round(diff * config.minuteHeight);
}

function getEventTop(event) {
    return event.start * config.minuteHeight;
}

function getRenderedEvent(event) {
    return '<div class="event"><div class="event-inner">' +
        '<div class="event-header" title="' + event.name + ' at ' + event.location + '">' +
        '<div class="name">' + event.name + '</div>' +
        '<div class="location">' + event.location + '</div>' +
        '</div>' +
        '<div class="event-content"></div>' +
        '</div></div>';
}

function drawEvents(events) {
    var html = events.map(function (event) {
        var $elm = $(getRenderedEvent(event));
        $elm.css({
            height: event.height,
            top: event.top,
            left: event.left,
            right: event.right
        });
        return $elm;
    });
    $events.find('.inner').html(html);
}

function layOutDay(events) {
    if (!events || !events.length) {
        console.debug('Whoa, this must be your day off...');
    }
    events.forEach(function (event) {
        event.height = getEventHeight(event);
        event.top = getEventTop(event);
        event.left = 0;
        event.right = 0;
        // assign default props for presenting
        event.location = event.location || 'Sample Location';
        event.name = event.name || 'Sample Item';
    });
    drawEvents(events);
}

var dummyEvents = [{
    start: 30,
    end: 150
}, {
    start: 540,
    end: 600
}, {
    start: 560,
    end: 620
}, {
    start: 610,
    end: 670
}];
setupDay();
layOutDay(dummyEvents);
