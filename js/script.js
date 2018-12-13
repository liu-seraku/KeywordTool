$(function () {
    var myChart;

    var urlParams = new URLSearchParams(location.search);
    var divOpen = urlParams.get('div');
    if (divOpen == "first-div") {
        $(".first-div").fadeIn();
    } else if (divOpen == "second-div") {
        $(".second-div").fadeIn();
        $(".portal-button").removeClass("active");
        $(".second-button").addClass("active");
    } else if (divOpen == "third-div") {
        $(".third-div").fadeIn();
        $(".portal-button").removeClass("active");
        $(".third-button").addClass("active");
    } else if (divOpen == "forth-div") {
        $(".forth-div").fadeIn();
        $(".portal-button").removeClass("active");
        $(".forth-button").addClass("active");
    } else {
        $(".first-div").fadeIn();
    }

    const xhr = new XMLHttpRequest();
    const url = "/getTrendKeywords";
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var dataList = xhr.response[0].trends;
            for (let index = 0; index < dataList.length; index++) {
                const topic = dataList[index].name;
                var topicDom = $("<span></span>").text(topic);
                var topicPortal = $("<span></span>").text(topic);
                $(".topics").append(topicDom);
                $(".keywords").append(topicPortal);
            }
            $(".topics span")
                .click(function () {
                    $(".topics span").removeClass("active");
                    $(this).addClass("active");
                    var value = $(this).text();
                    value = value.replace("#", "");
                    $(".input-panel input[type=\"text\"]").val(value);
                });
            $(".keywords span").click(function () {
                $(".keywords span").removeClass("active");
                $(this).addClass("active");
                var value = $(this).text();
                value = value.replace("#", "");
                $(".portal-selected").val(value);
                var link = $(".portal-web-sites").val();
                $(".portal-sites-btn").attr("href", link + value);
            });
        }
    };
    xhr.open('GET', url);
    xhr.send();

    getNhkUpdateLog();


    function getNhkUpdateLog() {
        $(".update-tbody").empty();
        const nhkUpdtLogReq = new XMLHttpRequest();
        var nhkUpdtLogReqUrl = "/getNhkUpdateLog/";
        nhkUpdtLogReq.open('GET', nhkUpdtLogReqUrl, false);
        nhkUpdtLogReq.send(null);
        if (nhkUpdtLogReq.status === 200) {
            var logList = JSON.parse(nhkUpdtLogReq.response);
            for (let index = 0; index < 4; index++) {
                if (logList[index]) {
                    const log = logList[index];
                    var logTr = $("<tr></tr>");
                    var logDateTd = $("<td></td>").text(log.date);
                    var logStartTd = $("<td></td>").text(log.start);
                    var logEndTd = $("<td></td>").text(log.end);
                    logTr.append(logDateTd).append(logStartTd).append(logEndTd);
                    $(".update-tbody").prepend(logTr);
                }
            }
        }
    }

    function setNhkUpdateLog(startTime, endTime) {
        const setNhkUpdtLogReq = new XMLHttpRequest();
        var date = startTime.slice(0, 10);
        var start = startTime.slice(11, 19);
        var end = endTime.slice(11, 19);
        var setNhkUpdtLogReqUrl = "/setNhkUpdateLog/?date=" + date + "&start=" + start + "&end=" + end;
        setNhkUpdtLogReq.open('GET', setNhkUpdtLogReqUrl, false);
        setNhkUpdtLogReq.send(null);
        if (setNhkUpdtLogReq.status === 200) {
            getNhkUpdateLog();
        }
    }

    function updateShows() {
        var startoffset = (new Date()).getTimezoneOffset() * 60000;
        var startTime = (new Date(Date.now() - startoffset)).toISOString();
        var serviceList = ["g1", "e1", "e4", "s1", "s3"];
        for (let serID = 0; serID < serviceList.length; serID++) {
            var serviceName = serviceList[serID];
            for (let day = 0; day < 8; day++) {
                var targetDay = new Date();
                targetDay.setDate(targetDay.getDate() + day);
                var targetDayISO = targetDay.toISOString();
                targetDayISO = targetDayISO.slice(0, 10);
                var request = new XMLHttpRequest();
                var url = "https://api.nhk.or.jp/v2/pg/list/130/" + serviceName + "/" + targetDayISO + ".json?key=PyID7ZVHHUOwBjmIDmaAONeOMBzzAABf";
                request.open('GET', url, false); // `false` で同期リクエストになる
                request.send(null);
                if (request.status === 200) {
                    var showlistStr = JSON.stringify(JSON.parse(request.response));
                    var partNumber = 4;
                    var partLength = Math.ceil(showlistStr.length / partNumber);
                    for (let part = 0; part < partNumber; part++) {
                        var partStr = showlistStr.slice(partLength * part, partLength * (part + 1));
                        var writeReq = new XMLHttpRequest();
                        var writeReqUrl = "/writeJSON?part=" + part + "&data=" + partStr + "&service=" + serviceName + "&baseDate=" + targetDayISO;
                        writeReq.open('GET', writeReqUrl, false);
                        writeReq.send(null);
                        if (writeReq.status === 201) {}
                    }
                }
            }
        }
        $(".processing").toggle();
        var Endoffset = (new Date()).getTimezoneOffset() * 60000;
        var endTime = (new Date(Date.now() - Endoffset)).toISOString();
        setNhkUpdateLog(startTime, endTime);
    }

    function getNhkSearchLog(keyword, serviceId) {
        var ctx = document.getElementById("canvas");
        $(".search-tbody").empty();
        var keyword = $(".search-input").val();
        var serviceId = $(".NHK-service").val();
        var serviceNames = {
            g1: "ＮＨＫ総合１",
            e1: "ＮＨＫＥテレ１",
            e4: "ＮＨＫワンセグ２",
            s1: "ＮＨＫＢＳ１",
            s3: "ＮＨＫＢＳプレミアム"
        };
        var showLogs = new Array();
        var request = new XMLHttpRequest();
        var url = "getNhkSearchLog/?keyword=" + keyword + "&serviceId=" + serviceId;
        request.open('GET', url, false);
        request.send(null);
        if (request.status === 200) {
            if (request.response !== "not found") {
                var showLog = JSON.parse(request.response);
                showLogs.push(showLog);
            }
        }
        if (showLogs.length !== 0) {
            var labels = new Array();
            var datasets = new Array();
            var borderColors = ['rgba(0, 123, 255, 1)', 'rgba(253, 92, 153, 1)', 'rgba(92, 253, 232, 1)', 'rgba(49, 250, 58, 1)', 'rgba(250, 229, 49, 1)'];
            for (let index = 0; index < showLogs.length; index++) {
                var showLog = showLogs[index];
                var data = new Array();
                for (let i = 0; i < showLog.length; i++) {
                    var oneLog = showLog[i];
                    var showDate = oneLog.baseDate;
                    var foundLabel = labels.indexOf(showDate);
                    if (foundLabel == -1) {
                        labels.push(showDate);
                    }
                    var showCount = parseInt(oneLog.count);
                    data.push(showCount);


                    var logSerId = showLog[0].service;
                    var logSerName = serviceNames[logSerId];
                    var logTr = $("<tr></tr>");
                    var serTd = $("<td></td>").text(logSerName);
                    var dateTd = $("<td></td>").text(showDate);
                    var countTd = $("<td></td>").text(showCount);
                    logTr.append(serTd).append(dateTd).append(countTd);
                    $(".search-tbody").append(logTr);
                }
                var logSerId = showLog[0].service;
                var logSerName = serviceNames[logSerId];
                var dataSet = {
                    label: logSerName,
                    data: data,
                    borderColor: borderColors[index],
                    borderWidth: 2
                };
                datasets.push(dataSet);
            }
            if (myChart) {
                myChart.data = {
                    labels: labels,
                    datasets: datasets
                };
                myChart.update();
            } else {
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: datasets
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            }
        } else {
            if (myChart) {
                myChart.data = {
                    labels: [],
                    datasets: [{
                        label: "キーワードの該当ログがありません",
                        data: [1, 1],
                        borderColor: 'rgba(0, 0, 0, 1)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderWidth: 2
                    }]
                };
                myChart.update();
            } else {
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: "キーワードの該当ログがありません",
                            data: [1, 1],
                            borderColor: 'rgba(0, 0, 0, 1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });

            }
            var noLogTr = $("<tr></tr>");
            var noLogTd = $("<td colspan=\"3\">キーワードの該当ログがありません</td>");
            noLogTr.append(noLogTd);
            $(".search-tbody").append(noLogTr);
        }

        $(".process-NHK").toggle();
    }


    $(".links span").click(function () {
        $(".links span").removeClass("active");
        $(this).addClass("active");
        var id = $(this).attr("id");
        $(".main > div").hide();
        $("div." + id).fadeIn();
    });

    $(".input-panel input").blur(function () {
        $(".topics span").removeClass("active");
    });

    $(".portal-selected").blur(function () {
        var link = $(".portal-web-sites").val();
        var keyword = $(this).val();
        $(".portal-sites-btn").attr("href", link + keyword);
    });

    $(".portal-web-sites").click(function () {
        var link = $(this).val();
        var keyword = $(".portal-selected").val();
        $(".portal-sites-btn").attr("href", link + keyword);
        if (link == "https://www.facebook.com/search/top/?q=") {
            $(".facebook-explanation").fadeIn();
        } else {
            $(".facebook-explanation").fadeOut();
        }
    });

    $(".update-btn").click(function () {
        $(".processing").toggle();
        setTimeout(updateShows, 100);
    });

    $(".portal-sites-btn").click(function () {
        var keyword = $(".portal-selected").val();
        if (keyword !== "") {
            var writeLogReq = new XMLHttpRequest();
            var writeLogReqUrl = "writeLog/?keyword=" + keyword;
            writeLogReq.open('GET', writeLogReqUrl, false);
            writeLogReq.send(null);
            if (writeLogReq.status === 200) {}
        }
    });

    $(".start-analyze").click(function () {
        var keyword = $(".analyze-input").val();
        if (keyword !== "") {
            var writeLogReq = new XMLHttpRequest();
            var writeLogReqUrl = "writeLog/?keyword=" + keyword;
            writeLogReq.open('GET', writeLogReqUrl, false);
            writeLogReq.send(null);
            if (writeLogReq.status === 200) {}
        }
    });

    $(".log-btn").click(function () {
        $(".logs").empty();
        var readLogReq = new XMLHttpRequest();
        var readLogReqReqUrl = "/readLog";
        readLogReq.open('GET', readLogReqReqUrl, false);
        readLogReq.send(null);
        if (readLogReq.status === 200) {
            var logStr = readLogReq.response;
            var logJson = JSON.parse(logStr);
            for (let index = 0; index < logJson.length; index++) {
                var oneLog = logJson[index];
                var logKeyword = oneLog.keyword;
                var logCount = oneLog.count;
                var logKeywordSpn = $("<span class=\"log-keyword\"></span>").text(logKeyword);
                var logCountSpn = $("<span class=\"log-count\">　( 回数： " + logCount + " )</span>");
                var logDiv = $("<div class=\"one-log\"></div>").append(logKeywordSpn).append(logCountSpn);
                $(".logs").append(logDiv);
            }
        }
    });

    $(".keyword-filter").keyup(function () {
        var keyword = $(this).val();
        if (keyword == "") {
            $(".one-log").removeClass("not-the-one");
        } else {
            var logSpan = $(".one-log .log-keyword");
            for (let index = 0; index < logSpan.length; index++) {
                var spanText = $(logSpan[index]).text();
                var found = spanText.indexOf(keyword);
                if (found == -1) {
                    $(logSpan[index]).parent().addClass("not-the-one");
                } else {
                    $(logSpan[index]).parent().removeClass("not-the-one");
                }
            }
        }
    });

    $(".nhk-search-log").click(function () {
        $(".process-NHK").toggle();
        setTimeout(getNhkSearchLog, 100);
    });

});