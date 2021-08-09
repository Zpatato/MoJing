const baseUrl = 'http://47.102.43.156:8002/'
const imgPathPre = './images/df/'
const scenarios = ['日常通勤', '特殊通勤（会议、会见客户）', '运动休闲', '情侣约会', '朋友聚会', '旅行度假', '宴会婚礼']
let currentCollocation;
let top_, bottom_, coat_;
let categories;
let collocationId;
// baseUrl = 'localhost:5000/'
const selects = ['style', 'color', 'season', 'shape', 'part', 'fabric']

function load() {
    checkCookie()
    $('#username').text($.cookie('username'))
    $.getJSON("main/js/attribute.json", function(data) {
        console.log(data)
        $.each(selects, function(i, d) {
            initSelect(data, d)
        })
    });

    $.getJSON("main/js/category.json", function(data) {
        console.log(data)
        categories = data
    })
    $('#submit_score_error').hide()
    $('#score_empty').hide()
    $('#score_error').hide()
    $('#search').hide()
    $('#delete_success').hide()
}

function logout() {
    $.removeCookie('username', { path: '/' })
    window.location.href = 'login.html'
}

function initSelect(data, item) {
    const id = '#select_' + item
    $.each(data[item], function(i, d) {
        // console.log(i, d)
        var li = "<option value=\"" + d['attr_id'] + "\">" + d['name_en'] + "(" + d['name_zh'] + ")" + "</option>";
        $(id).append(li);
    })
}

$("#ImgClothes").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {
        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
        $(".clothes_box").empty().append(img);
    }
});

$("#ImgTrousers").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {
        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
        $(".trousers_box").empty().append(img);
    }
});

$("#ImgCoat").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {
        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
        $(".coat_box").empty().append(img);
    }
});

function submitFilter() {
    const r = {};
    $('#all_images').hide()
    $('#search').show()
    $('#select_scenario').val(0).attr("selected", true)
    for (let i = 1; i <= 7; i++) {
        $('#score_' + i).val("")
    }
    $('#submit_score_error').hide()
    $('#submit_score_success').hide()
    $.each(selects, function(i, d) {
        const id = '#select_' + d + ' option:selected'
            // console.log(id)
        r[d] = $(id).text().split('(')[0]
    })
    r['suits'] = $('#select_collo').val()
    console.log(r)
    $.ajax({
        url: baseUrl + 'api/search/collocations',
        contentType: 'application/json',
        type: 'post',
        // dataType: "json",
        data: JSON.stringify(r),
        success: function(data) {
            data = data.replaceAll('ObjectId(', '')
            data = data.replaceAll(')', '')
            data = data.replaceAll('\'', '"')
            console.log(data)
            currentCollocation = JSON.parse(data)
            console.log(data)
                // console.log('成功', currentCollocation)
            coat_ = currentCollocation['coat']
            top_ = currentCollocation['top']
            bottom_ = currentCollocation['bottom']
            collocationId = currentCollocation['_id']
            $('#collo').text('上传搭配')
            let image_sections = []
            if (r['suits'] === '2') {
                $('#coat').hide()
                $('#coat_left').show()
                image_sections = ['top', 'bottom']
            } else if (r['suits'] === '3') {
                $('#coat').show()
                $('#coat_left').hide()
                image_sections = ['coat', 'top', 'bottom']
            }
            $.each(image_sections, function(i, d) {
                // console.log(d)
                // console.log(currentCollocation[d])
                showImage(d, currentCollocation[d])
            })
            $('#search').hide()
            $('#all_images').show()
            $('#submit_score').attr("disabled", false)
            $('#delete_success').hide()
        },
        error: function(err) {
            $('#all_images').hide()
            $('#collo').text('无满足条件的搭配推荐，请修改筛选条件重试...')
            console.log('失败', err);
        }
    });
}