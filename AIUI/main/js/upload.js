let selects2 = ['Style', 'Texture', 'Shape', 'Fabric', 'Part']
let topImage, bottomImage, coatImage
let attrs = {
    'top': [],
    'bottom': [],
    'coat': []
}

function load() {
    checkCookie()

    $('#submit_score_success').hide()
    $('#score_empty').hide()
    $('#score_error').hide()
    $('#upload_error').hide()
    $('#username').text($.cookie('username'))
    $.getJSON("main/js/attribute_filter.json", function(data) {
        console.log(data)
        $.each(selects2, function(i, d) {
            initSelect(data, d)
        })
    });

    $.getJSON("main/js/category.json", function(data) {
        console.log(data)
        categories = data
    })
    changeListener()
    boxChangeListener()
}

function logout() {
    $.removeCookie('username', { path: '/' })
    window.location.href = 'login.html'
}

function initSelect(data, item) {
    $.each(['top', 'bottom', 'coat'], function (j, s){
        const id = '#' + s + item
        $.each(data[item.toLowerCase()], function(i, d) {
            // console.log(i, d)
            var li = "<option value=\"" + d['attr_id'] + "\">" + d['name_en'] + "(" + d['name_zh'] + ")" + "</option>";
            $(id).append(li);
        })
    })
}

function changeListener(){
    $.each(['topImage', 'bottomImage', 'coatImage'], function (i, d){
        $("#"+d).on("change", function(e) {
            console.log('变动生效')
            var file = e.target.files[0]; //获取图片资源
            if (file === undefined){
                $("#"+d+'Pre').attr('src', '')
            }
            // 只选择图片文件
            if (!file.type.match('image.*')) {
                return false;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file); // 读取文件
            // 渲染文件
            reader.onload = function(arg) {
                // console.log(arg.target.result)
                $("#"+d+'Pre').attr('src', arg.target.result)
            }
            let id, type
            if (d === 'topImage'){
                id = 'submitTop'
                type = 'top'
            }
            else if (d === 'bottomImage'){
                id = 'submitBottom'
                type = 'bottom'
            }
            else{
                id = 'submitCoat'
                type = 'coat'
            }
            updateSubmitButton(id, false)
            removeBoxes(type)
        });
    })
}

function submitImage(type){
    const img = $('#'+type+'ImagePre').attr('src')
    if (img === '') {
        $('#'+type+'Info').text('请上传图片...')
    }else{
        $('#'+type+'Info').text('')
        let data = {}
        data["img"] = img
        data["category"] = $('#'+type+'Class option:selected').text().split('(')[0]
        // let attrs = []
        // $.each(selects2, function (i, d){
        //     const id = '#'+type+d + ' option:selected'
        //     attrs.unshift($(id).text().split('(')[0])
        // })
        data["attributes"] = attrs[type]
        console.log(data)
        $.ajax({
            url: baseUrl + 'api/upload',
            contentType: 'application/json',
            type: 'post',
            data: JSON.stringify(data),
            success: function (d){
                if (type === 'top'){
                    topImage = d
                    updateSubmitButton('submitTop', true)
                }else if (type === 'bottom'){
                    bottomImage = d
                    updateSubmitButton('submitBottom', true)
                }else{
                    coatImage = d
                    updateSubmitButton('submitCoat', true)
                }
            },
            error: function (err){
                console.log('upload failed')
            }
        })
    }
}

function updateSubmitButton(id, success){
    console.log('update', id)
    elem = $('#'+id)
    if (success){
        elem.html('<i class="fa fa-check"></i>提交成功')
        elem.attr('class', 'btn btn-info disabled')
        elem.attr('onclick', '')
    }else{
        if (id === 'submitTop'){
            elem.html('提交上衣图片及标签')
            elem.attr('onclick', 'submitImage(\'top\')')
        }else if (id === 'submitBottom'){
            elem.html('提交下装图片及标签')
            elem.attr('onclick', 'submitImage(\'bottom\')')
        }else{
            elem.html('提交外套图片及标签')
            elem.attr('onclick', 'submitImage(\'coat\')')
        }
        elem.attr('class', 'btn btn-info')
    }
}

function submitNewScore() {
    checkCookie()
    $('#submit_score_success').hide()
    $('#score_empty').hide()
    $('#score_error').hide()
    $('#upload_error').hide()

    if (topImage === undefined || bottomImage === undefined){
        $('#upload_error').show()
        return
    }

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
        let r
        if (coatImage === undefined){
            r = {
                'top' : JSON.parse(topImage),
                'bottom' : JSON.parse(bottomImage),
                'score' : r_scores,
                'scenario' : r_scenarios,
                'username' : $.cookie('username'),
                'suit': 2
            }
        }else{
            r = {
                'top' : JSON.parse(topImage),
                'bottom' : JSON.parse(bottomImage),
                'coat': JSON.parse(coatImage),
                'score' : r_scores,
                'scenario' : r_scenarios,
                'username' : $.cookie('username'),
                'suit': 3
            }
        }

        $.ajax(
            {
                url: baseUrl + 'api/newScoring',
                contentType: 'application/json',
                type: 'post',
                data: JSON.stringify(r),
                success: function (data) {
                    $('#submit_score_success').show()
                    $.each(scenarios, function (i, d){
                        $('#score_' + (i+1)).val("")
                    })
                    console.log(data)
                },
                error: function (err) {
                    console.log('失败', err);
                }
            }
        );
    }
}

function generateBox(type, attr){
    let div = '<div class="col-xl-2 col-12" id="'+type+attr+'">\n' +
        '     <div class="mb-0 box box-inverse box-success">\n' +
        '         <div class="box-header pt-10 pb-10 pl-10">\n' +
        '             <p class="box-title" >'+attr+'</p>\n' +
        '             <div class="box-tools pull-right">' +
        '                 <i class="ti-close" onclick="removeAttr(\''+type+'\',\''+attr+'\')"></i>'+
        '             </div>\n' +
        '         </div>\n' +
        '     </div>\n' +
        ' </div>'
    $('#'+type+'Attrs').append(div)
}

function boxChangeListener(){
    $.each(['top', 'bottom', 'coat'], function (i, d){
        $.each(selects2, function (j, d2){
            let id = '#'+d+d2
            $(id).on('change', function (e){
                const attr = $(id + ' option:selected').text().split('(')[0]
                if (attrs[d].indexOf(attr) === -1) {
                    attrs[d].unshift(attr)
                    generateBox(d, attr)
                }
            })
        })
    })
}

function addAttr(type){
    let attr = $('#'+type+'Custom').val()
    if (attr !== ''){
        attrs[type].unshift(attr)
        generateBox(type, attr)
        $('#'+type+'Custom').val('')
    }
}

function removeAttr(type, attr){
    if (attrs[type].indexOf(attr) !== -1){
        attrs[type].splice(attrs[type].indexOf(attr),1)
        let t = document.getElementById(type+'Attrs')
        let c = document.getElementById(type+attr)
        t.removeChild(c)
    }
}

function removeBoxes(type){
    $('#'+type+'Attrs').empty()
    attrs[type] = []
}