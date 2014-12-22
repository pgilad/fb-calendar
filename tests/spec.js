var dummyEvents2 = [{
    start: 233,
    end: 373,
}, {
    start: 259,
    end: 528,
}, {
    start: 50,
    end: 700
}, {
    start: 415,
    end: 554,
}, {
    start: 514,
    end: 630
}, {
    start: 0,
    end: 715
}, {
    start: 700,
    end: 720
}];

var dummyEvents3 = [{
    start: 184,
    end: 588
}, {
    start: 262,
    end: 453
}, {
    start: 275,
    end: 603
}, {
    start: 302,
    end: 527
}, {
    start: 447,
    end: 463
}, {
    start: 501,
    end: 605
}, {
    start: 515,
    end: 534
}, {
    start: 527,
    end: 578
}, {
    start: 603,
    end: 637
}];

var dummyEvents4 = [{
    start: 276,
    end: 618
}, {
    start: 351,
    end: 649
}, {
    start: 427,
    end: 453
}, {
    start: 479,
    end: 602
}, {
    start: 510,
    end: 692
}, {
    start: 666,
    end: 693
}];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var dummyRandom = [];
var amount = getRandomInt(1, 10);
for (var i = 0; i < amount; ++i) {
    var start = getRandomInt(0, 720);
    var end = getRandomInt(start, 720);
    if (end - start > 15) {
        dummyRandom.push({
            start: start,
            end: end
        });
    }
}
