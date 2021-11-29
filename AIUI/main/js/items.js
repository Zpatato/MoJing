const baseUrl = 'http://47.102.43.156:8002/'
const imgPathPre = './images/df/'
const scenarios = ['日常通勤','特殊通勤（会议、会见客户）','运动休闲','情侣约会', '朋友聚会', '旅行度假', '宴会婚礼']
let currentCollocation;
let top_, bottom_, coat_;
let categories;
let collocationId;
// baseUrl = 'localhost:5000/'
const selects = ['style', 'color', 'season', 'shape', 'part', 'fabric']

function load() {
    checkCookie()
    $('#username').text($.cookie('username'))
    $.getJSON("main/js/attribute.json", function (data) {
        console.log(data)
        $.each(selects, function (i, d) {
            initSelect(data, d)
        })
    });

    $.getJSON("main/js/category.json", function (data) {
        console.log(data)
        categories = data
    })
    $('#submit_score_error').hide()
    $('#score_empty').hide()
    $('#score_error').hide()
    $('#search').hide()
    $('#delete_success').hide()
}

function logout(){
    $.removeCookie('username', { path: '/' })
    window.location.href = 'login.html'
}

function initSelect(data, item) {
    checkCookie()
    const id = '#select_' + item
    $.each(data[item], function (i, d) {
        // console.log(i, d)
        var li = "<option value=\"" + d['attr_id'] + "\">" + d['name_en'] + "(" + d['name_zh'] + ")" + "</option>";
        $(id).append(li);
    })
}

function submitFilter() {
    checkCookie()
    const r = {};
    $('#all_images').hide()
    $('#search').show()
    $('#select_scenario').val(0).attr("selected",true)
    for (let i = 1; i <= 7; i++){
        $('#score_' + i).val("")
    }
    $('#submit_score_error').hide()
    $('#submit_score_success').hide()
    $.each(selects, function (i, d) {
        const id = '#select_' + d + ' option:selected'
        // console.log(id)
        r[d] = $(id).text().split('(')[0]
    })
    r['suits'] = $('#select_collo').val()
    console.log(r)
    $.ajax(
        {
            url: baseUrl + 'api/search/collocations',
            contentType: 'application/json',
            type: 'post',
            // dataType: "json",
            data: JSON.stringify(r),
            success: function (data) {
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
                $('#collo').text('搭配推荐')
                let image_sections = []
                if (r['suits'] === '2'){
                    $('#coat').hide()
                    $('#coat_left').show()
                    image_sections = ['top', 'bottom']
                }
                else if (r['suits'] === '3'){
                    $('#coat').show()
                    $('#coat_left').hide()
                    image_sections = ['coat', 'top', 'bottom']
                }
                $.each(image_sections, function (i, d) {
                    // console.log(d)
                    // console.log(currentCollocation[d])
                    showImage(d, currentCollocation[d])
                })
                $('#search').hide()
                $('#all_images').show()
                $('#submit_score').attr("disabled", false)
                $('#delete_success').hide()
            },
            error: function (err) {
                $('#all_images').hide()
                $('#collo').text('无满足条件的搭配推荐，请修改筛选条件重试...')
                console.log('失败', err);
            }
        });
}

function showImage(type, d) {
    checkCookie()
    $('#' + type + '_img').attr('src', imgPathPre + d['image_path'])
    $('#' + type + '_img_a').attr('href', imgPathPre + d['image_path'])
    $('#' + type + '_h').text(d['category'])
    $('#' + type + '_attr').text(categories[d['category']])
}

function submitScore() {
    checkCookie()
    $('#submit_score_success').hide()
    $('#score_empty').hide()
    $('#score_error').hide()
    let scores = {}
    let invalid = false
    $.each(scenarios, function (i, s){
        let score = parseInt($('#score_' + (i+1)).val())
        if (!isNaN(score)){
            scores[s] = score
        }
        if (score < 0 || score > 100){
            invalid = true
        }
    })
    if($.isEmptyObject(scores)){
        $('#submit_score_error').show()
        $('#score_empty').show()
    }else if (invalid){
        $('#submit_score_error').show()
        $('#score_error').show()
    }
    else {
        $('#submit_score_error').hide()
        let r_scores = []
        let r_scenarios = []
        for (const key in scores){
            r_scenarios.unshift(key)
            r_scores.unshift(scores[key])
        }
        let r = {
            'id' : collocationId,
            'score' : r_scores,
            'scenario' : r_scenarios,
            'username' : $.cookie('username')
        }
        $.ajax(
            {
                url: baseUrl + 'api/update/score',
                contentType: 'application/json',
                type: 'post',
                data: JSON.stringify(r),
                success: function (data) {
                    $('#submit_score_success').show()
                    console.log(data)
                },
                error: function (err) {
                    console.log('失败', err);
                }
            }
        );
    }
}

function deleteItem(type){
    checkCookie()
    let item = type === 'coat' ? coat_ : type === 'top' ? top_ : bottom_;
    $.ajax({
        url: baseUrl + 'api/delete/collocation', //api/delete
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify(
            {
                '_id': item['_id']
            }
        ),
        success: function (data){
            console.log('deleteItem: ', data)
            $('#delete_success').show()
            $('#submit_score').attr("disabled", true)
        }
    })
}