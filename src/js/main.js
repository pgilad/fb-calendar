'use strict';
/* global $ */

var calendarApp = function ($, $container) {
    var $timeContainer = $container.find('.calendar-time');
    var $eventsContainer = $container.find('.calendar-events');
    var collisionGroups = [];

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

    function setupDay() {
        $eventsContainer.css({
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
        $timeContainer.html(timeHtml);
        // container is ready to show now. This is done to prevent FOUC
        $container.show();
    }

    // scale events to fit in our container
    function getEventHeight(event) {
        //TODO: think about minimum display time (if event is too short)
        var diff = event.end - event.start;
        return Math.round(diff * config.minuteHeight);
    }

    function getEventTop(event) {
        return event.start * config.minuteHeight;
    }

    function getRenderedEvent(event) {
        return '<div class="event"><div class="event-inner inner">' +
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
                width: event.width
            });
            return $elm;
        });
        // insert events at .calendar.events > .inner
        $eventsContainer.find('.inner').html(html);
    }

    function collidesWith(eventA, eventB) {
        if (!eventB) {
            return false;
        }
        return eventA.start < eventB.end && eventA.end > eventB.start;
    }

    // sort the events by the start time
    function sortByStart(a, b) {
        return a.start - b.start;
    }

    function joinCollidingEvents(events, startingIndex) {
        var j = 1;
        var event = events[startingIndex];
        while (collidesWith(event, events[startingIndex + j])) {
            events[startingIndex + j].collisionGroup = event.collisionGroup;
            j++;
        }
    }

    function isEmptyCell(cell) {
        return typeof cell !== 'number';
    }

    function buildGroup(events, index) {
        var event = events[index];
        // new collision group
        if (!event.collisionGroup) {
            var newGroup = [];
            collisionGroups.push(newGroup);
            event.collisionGroup = newGroup;
        }
        joinCollidingEvents(events, index);
        var group = event.collisionGroup;
        var placed = false;
        // start from row 0
        var row = 0;
        var column = 0;
        while (!placed) {
            // make sure row exists
            group[row] = group[row] || [];
            // get current event
            var current = group[row][column];
            // if it's the same event (skip to to the right)
            if (current === index) {
                column++;
                continue;
            }
            //if cell is not empty - check for collisions
            //and decide whether to move right or down
            if (!isEmptyCell(current)) {
                if (collidesWith(events[current], event)) {
                    // move right
                    column++;
                } else {
                    //move down
                    row++;
                    column = 0;
                }
                continue;
            }
            // start skipping to right if row size is bigger than our location
            if (column < group[row].length - 1) {
                column++;
                continue;
            }

            var upOffset = 1;
            var upRow = group[row - upOffset];
            var upper = upRow && upRow[column];
            // find the upper non-empty event to check for collision
            while (upRow && isEmptyCell(upper)) {
                upOffset++;
                upRow = group[row - upOffset];
                upper = upRow && upRow[column];
            }
            // got a top non-empty event - check for collisions
            if (upRow && !isEmptyCell(upper) && collidesWith(events[upper], event)) {
                column++;
            } else {
                // found a spot to put it
                group[row][column] = index;
                placed = true;
            }
        }
    }

    function getMaxRowSize(group) {
        return group.reduce(function (currentMax, row) {
            return row.length > currentMax ? row.length : currentMax;
        }, 0);
    }

    function layOutDay(events) {
        if (!events || !events.length) {
            console.debug('Whoa, this must be your day off...');
        }
        // sort events by start time
        events.sort(sortByStart);

        // iterate events building the collisions groups and setting general props
        events.forEach(function (event, index) {
            if (event.start > event.end) {
                console.warn('Oh no, the impossible happened, a bad event! Hiding it...', event);
                event.left = event.right = event.top = event.height = 0;
                return;
            }
            event.height = getEventHeight(event);
            event.top = getEventTop(event);
            // assign default props for presenting
            event.location = event.location || 'Sample Location';
            event.name = event.name || 'Sample Item';
            buildGroup(events, index);
        });

        // iterate collision groups and set their events left prop and width
        collisionGroups.forEach(function (group) {
            var columnSize = config.containerWidth / getMaxRowSize(group);
            group.forEach(function (row) {
                row.forEach(function (column, j) {
                    events[column].left = j * columnSize;
                    events[column].width = columnSize;
                });
            });
        });
        drawEvents(events);
    }

    return {
        setupDay: setupDay,
        layOutDay: layOutDay,
        config: config
    };
};

// start with document.ready
$(function () {
    var $container = $('.day-view');
    var app = calendarApp($, $container);

    //set initial day according to config
    app.setupDay();

    var initialEvents = [{
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

    app.layOutDay(initialEvents);
    //expose app to window
    window.app = app;
    // expose layOutDay as global function
    window.layOutDay = app.layOutDay;
});
