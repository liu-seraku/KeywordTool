$(function () {

    $('*[data-toggle="tooltip"]').tooltip();

    var urlParams = new URLSearchParams(location.search);
    var keywordVal = urlParams.get('keyword');
    var keyword = new Array();
    $(".selected").text(keywordVal);
    $(".NHK-keyword").val(keywordVal);
    var searchUrl = $(".searching-btn").attr("href");
    $(".searching-btn").attr("href", searchUrl + keywordVal);
    keyword.push(keywordVal);
    var endDate = new Date();
    var endDateISO = endDate.toISOString();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    var startDateISO = startDate.toISOString();
    startDateISO = startDateISO.slice(0, 10);
    endDateISO = endDateISO.slice(0, 10);
    $(".start-date").val(startDateISO);
    $(".end-date").val(endDateISO);
    var myChart;

    var firstInputElm = $("input.keyword")[0];
    $(firstInputElm).val(keyword);

    function openNav() {
        document
            .getElementById("mySidebar")
            .style
            .width = "13%";
        document
            .getElementById("main")
            .style
            .marginLeft = "13%";
        $(this).hide();
        $(".left").show();
    }

    function closeNav() {
        document
            .getElementById("mySidebar")
            .style
            .width = "0";
        document
            .getElementById("main")
            .style
            .marginLeft = "0";
        $(this).hide();
        $(".right").show();
    }

    function activeSpan(dom) {

        $("span.tpc").removeClass("active");
        $(dom).addClass("active");
        var textVal = $(dom).text();
        $(".selected").text(textVal);
        $(".NHK-keyword").val(textVal);
        var keyword = $(".topic-label").text();
        var url = $(".web-sites").val();
        $(".searching-btn").attr("href", url + keyword + " " + textVal);
    }

    function drawGraph(keyword, jsonObj) {
        var ctx = document.getElementById("canvas");
        var labels = new Array();
        var titles = jsonObj.default.timelineData;
        for (let index = 0; index < titles.length; index++) {
            var title = titles[index].formattedAxisTime;
            labels.push(title);
        }
        var lineNum = keyword.length;
        var borderColors = ['rgba(0, 123, 255, 1)', 'rgba(253, 92, 153, 1)', 'rgba(92, 253, 232, 1)', 'rgba(49, 250, 58, 1)', 'rgba(250, 229, 49, 1)'];
        var datasets = new Array();
        for (let index = 0; index < lineNum; index++) {
            var number = index;
            var data = new Array();
            for (let index = 0; index < titles.length; index++) {
                if (keyword.length == 1) {
                    var formattedValue = titles[index].formattedValue;
                    data.push(formattedValue);
                } else {
                    var formattedValue = titles[index].formattedValue[number];
                    data.push(formattedValue);
                }

            }
            var dataset = {
                label: keyword[number],
                data: data,
                borderColor: borderColors[number],
                borderWidth: 2
            };
            datasets.push(dataset);
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

        $(".process-graft").toggle();

    }

    function interestOverTime(keyword) {
        var keyword = keyword;
        var startTime = $(".start-date").val();
        var endTime = $(".end-date").val();
        const xhr = new XMLHttpRequest();
        const url = '/interestOverTime/' + keyword + '?geo=JP&startTime=' + startTime + '&endTime=' + endTime;
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                drawGraph(keyword, xhr.response);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function relatedTopics(keyword) {
        var keyword = keyword;
        $(".topic-label").text(keyword);
        $(".tpcs").empty();
        $(".hit-tpcs").empty();
        var startTime = $(".start-date").val();
        var endTime = $(".end-date").val();
        const xhr = new XMLHttpRequest();
        const url = '/relatedTopics/' + keyword + '?geo=JP&startTime=' + startTime + '&endTime=' + endTime;
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (!xhr.response) {
                    var notFoundSpan1 = $("<span class=\"not-found\">関連キーワードが見つかりませんでした</span>");
                    var notFoundSpan2 = $("<span class=\"not-found\">関連キーワードが見つかりませんでした</span>");
                    $(".tpcs").append(notFoundSpan1);
                    var liElement = $("<li></li>").append(notFoundSpan2);
                    $('.hit-tpcs').append(liElement);
                } else {
                    var relatedList = xhr.response.default.rankedList[0].rankedKeyword;
                    var hitList = xhr.response.default.rankedList[1].rankedKeyword;

                    if (relatedList.length == 0) {
                        var notFoundSpan1 = $("<span class=\"not-found\">関連キーワードが見つかりませんでした</span>");
                        $(".tpcs").append(notFoundSpan1);
                    } else {
                        for (let index = 0; index < relatedList.length; index++) {
                            if (xhr.response.default.rankedList[0].rankedKeyword[index]) {
                                const topic = xhr.response.default.rankedList[0].rankedKeyword[index].topic.title;
                                var topicDom = $("<span class=\"tpc\"></span>").text(topic);
                                $(".tpcs").append(topicDom);
                            }

                        }
                    }

                    if (hitList.length == 0) {
                        var notFoundSpan2 = $("<span class=\"not-found\">関連キーワードが見つかりませんでした</span>");
                        var liElement = $("<li></li>").append(notFoundSpan2);
                        $('.hit-tpcs').append(liElement);
                    } else {
                        var hitTopics = xhr.response.default.rankedList[1].rankedKeyword;
                        for (let index = 0; index < hitTopics.length; index++) {
                            var topicTitle = hitTopics[index].topic.title;
                            var hitStatus = hitTopics[index].formattedValue;
                            var topicSpan = $("<span class=\"tpc\"></span>").text(topicTitle);
                            var hitSpan = $("<span class=\"hit\"></span>").text(hitStatus);
                            var liElement = $("<li></li>")
                                .append(topicSpan)
                                .append(hitSpan);
                            $('.hit-tpcs').append(liElement);
                        }
                    }

                    $(".topics span.tpc")
                        .click(function () {
                            activeSpan(this);
                        });
                }
                $(".process-related").toggle();
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function addKeyPanel() {
        var hiddenKeyEle = $(".keyword-panel.option")[0];
        $(hiddenKeyEle).removeClass("option");
    }

    function setNhkSearchLog(keyword, service, baseDate, showCount) {
        const request = new XMLHttpRequest();
        const url = "/setNhkSearchLog?keyword=" + keyword + "&service=" + service + "&baseDate=" + baseDate + "&showCount=" + 
        showCount;
        request.open('GET', url, false);
        request.send(null);
        if (request.status === 200) {
            return null;
        }
    }

    function generateTbody() {
        $(".NHK-tbody").empty();
        var serviceList = {
            g1: "ＮＨＫ総合１",
            e1: "ＮＨＫＥテレ１",
            e4: "ＮＨＫワンセグ２",
            s1: "ＮＨＫＢＳ１",
            s3: "ＮＨＫＢＳプレミアム"
        }
        var keyword = $(".NHK-keyword").val();
        var serviceId = $(".NHK-service").val();
        var serviceName = serviceList[serviceId];
        for (let day = 0; day < 8; day++) {
            var targetDay = new Date();
            targetDay.setDate(targetDay.getDate() + day);
            var targetDayISO = targetDay.toISOString();
            targetDayISO = targetDayISO.slice(0, 10);
            var service = serviceId;
            var baseDate = targetDayISO;

            var getFileReq = new XMLHttpRequest();
            var getFileReqUrl = "readFile/?service=" + service + "&baseDate=" + baseDate;
            getFileReq.open('GET', getFileReqUrl, false);
            getFileReq.send(null);
            if (getFileReq.status === 200) {
                var showListJson = JSON
                    .parse(getFileReq.response)
                    .list[service];
                showNums = showListJson.length;
                var showCount = 0;
                for (let showNum = 0; showNum < showNums; showNum++) {
                    var show = showListJson[showNum];
                    var showTitle = show.title;
                    var showSubtitle = show.subtitle;
                    var showContent = show.content;
                    var showAct = show.act;
                    var showDetailStr = showTitle + showSubtitle + showContent + showAct;
                    var showStartTime = show.start_time.slice(11, 16);
                    var showEndTime = show.end_time.slice(11, 16);
                    var showDate = baseDate;
                    var foundShow = showDetailStr.indexOf(keyword);
                    if (foundShow !== -1) {
                        showCount = showCount + 1;
                        var showTr = $("<tr class=\"NHK-result\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"番組の詳細を表示・非表示\"></tr>");
                        var showServiceTd = $("<td></td>").text(serviceName);
                        var showDayTd = $("<td></td>").text(showDate);
                        var showStartTd = $("<td></td>").text(showStartTime);
                        var showEndTd = $("<td></td>").text(showEndTime);
                        var showTitleTd = $("<td class=\"show-title\"></td>").text(showTitle);
                        showTr.append(showServiceTd).append(showDayTd).append(showStartTd).append(showEndTd).append(showTitleTd);
                        $(".NHK-tbody").append(showTr);
                        $('*[data-toggle="tooltip"]').tooltip();

                        var showDetailTr = $("<tr class=\"show-detail\"></tr>");
                        var detailTd = $("<td colspan=\"5\"></td>");
                        var subtitleTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">サブタイトル</div>");
                        var subtitleDDiv = $("<div style=\"margin: 1rem;\"></div>").text(showSubtitle);
                        var contentTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">コンテンツ</div>");
                        var contentDDiv = $("<div style=\"margin: 1rem;\"></div>").text(showContent);
                        var actTDiv = $("<div style=\"margin: 1rem; font-weight: bolder;\">出演者</div>");
                        var actDDiv = $("<div style=\"margin: 1rem;\"></div>").text(showAct);
                        detailTd.append(subtitleTDiv).append(subtitleDDiv).append(contentTDiv).append(contentDDiv).append(actTDiv).append(actDDiv);
                        showDetailTr.append(detailTd);
                        $(".NHK-tbody").append(showDetailTr);

                        showTr.click(function () {
                            $(this).next().toggle();
                        });
                    }
                }
                setNhkSearchLog(keyword, service, baseDate, showCount);
            }
        }

        var resultCount = $("tr").length - 1;
        if (resultCount == 0) {
            var showDetailTr = $("<tr></tr>");
            var detailTd = $("<td colspan=\"5\">該当番組はありません。</td>");
            showDetailTr.append(detailTd);
            $(".NHK-tbody").append(showDetailTr);
        }

        $(".processing").toggle();
    }

    $(".right").click(openNav);
    $(".left").click(closeNav);
    $(".related-btn").click(function () {
        var topic = $(this)
            .prev()
            .val();
        $(".selected").text(topic);
        $(".NHK-keyword").val(topic);
        if (topic !== "") {
            var writeLogReq = new XMLHttpRequest();
            var writeLogReqUrl = "writeLog/?keyword=" + topic;
            writeLogReq.open('GET', writeLogReqUrl, false);
            writeLogReq.send(null);
            if (writeLogReq.status === 200) {}
        }

        $(".process-related").toggle();
        setTimeout(relatedTopics(topic), 100);
    });
    $(".add-key-btn").click(function () {
        var hiddenKeyNum = $(".keyword-panel.option").length;
        if (hiddenKeyNum == 1) {
            $(this).hide();
        }
        addKeyPanel();
    });
    $(".delete-btn").click(function () {
        var hiddenKeyNum = $(".keyword-panel.option").length;
        if (hiddenKeyNum == 0) {
            $(".add-key-btn").show();
        }
        $(this)
            .prev()
            .prev()
            .val("");
        $(this)
            .parent()
            .addClass("option");
    });
    $(".start-analyze").click(function () {
        var keywords = new Array();
        var keywordsEle = $("input.keyword");
        for (let index = 0; index < keywordsEle.length; index++) {
            const element = keywordsEle[index];
            var oneKeyword = $(element).val();
            if (oneKeyword) {
                keywords.push(oneKeyword);
            }
        }
        if (keywords.length > 0) {
            window.location = "#canvas";
            $(".process-graft").toggle();
            for (let index = 0; index < keywords.length; index++) {
                var keyword = keywords[index];
                if (keyword !== "") {
                    var writeLogReq = new XMLHttpRequest();
                    var writeLogReqUrl = "writeLog/?keyword=" + keyword;
                    writeLogReq.open('GET', writeLogReqUrl, false);
                    writeLogReq.send(null);
                    if (writeLogReq.status === 200) {}
                }
            }
            setTimeout(interestOverTime(keywords), 100);
        } else {
            alert("図表分析のキーワードを入力してください");
        }
    });

    $(".web-sites").click(function () {
        var url = $(this).val();
        var keyword = $(".topic-label").text();
        var relatedKeyword = $(".selected").text();
        $(".searching-btn").attr("href", url + keyword + " " + relatedKeyword);
        if (url == "https://www.facebook.com/search/top/?q=") {
            $(".facebook-explanation").show();
        } else {
            $(".facebook-explanation").hide();
        }
    });

    $(".NHK-btn").click(function () {
        var keyword = $(".NHK-keyword").val();
        $(".NHK-key").text(keyword);
        if (keyword !== "") {
            var writeLogReq = new XMLHttpRequest();
            var writeLogReqUrl = "writeLog/?keyword=" + keyword;
            writeLogReq.open('GET', writeLogReqUrl, false);
            writeLogReq.send(null);
            if (writeLogReq.status === 200) {}
        }
        $(".processing").toggle();
        setTimeout(generateTbody, 100);
    });

    $(".searching-btn").click(function () {
        var keyword = $(".selected").text();
        if (keyword !== "") {
            var writeLogReq = new XMLHttpRequest();
            var writeLogReqUrl = "writeLog/?keyword=" + keyword;
            writeLogReq.open('GET', writeLogReqUrl, false);
            writeLogReq.send(null);
            if (writeLogReq.status === 200) {}
        }
    });
});