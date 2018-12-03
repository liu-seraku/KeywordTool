$(function () {

    $(".third-div").fadeIn();

    const xhr = new XMLHttpRequest();
    const url = "/getTrendKeywords";
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            var dataList = xhr.response[0].trends;
            for (let index = 0; index < dataList.length; index++) {
                const topic = dataList[index].name;
                var topicDom = $("<span></span>").text(topic);
                $(".topics").append(topicDom);
            }
            $(".topics span").click(function () {
                $(".topics span").removeClass("active");
                $(this).addClass("active");
                var value = $(this).text();
                value = value.replace("#", "");
                $(".input-panel input[type=\"text\"]").val(value);
            });
        }
    };
    xhr.open('GET', url);
    xhr.send();

    $(".links span").click(function () {
        $(".links span").removeClass("active");
        $(this).addClass("active");
        var id = $(this).attr("id");
        $(".main > div").hide();
        $("div." + id).show();
    });

    $(".keywords span").click(function () {
        $(".keywords span").removeClass("active");
        $(this).addClass("active");
        var value = $(this).text();
        var newSpan = $("<span></span>").text(value);
        $(".selected-k").empty();
        $(".selected-k").append(newSpan);
    });

    $(".input-panel input").blur(function () {
        $(".topics span").removeClass("active");
    });

});