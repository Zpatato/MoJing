
function onloadLogin(){
    let user, pwd;
    user = $.cookie('username');
    pwd = $.cookie('password');
    if (user === undefined){
        console.log('no cookies')
    } else {
        $('#username').val(user)
        $('#password').val(pwd)
    }
}

function signInButton(){
    signIn($('#username').val(), $('#password').val())
}

function signIn(username, password){
    $.ajax({
        url: baseUrl + 'api/user/login',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function (ret){
            ret = ret.replaceAll('ObjectId(', '')
            ret = ret.replaceAll(')', '')
            ret = ret.replaceAll('\'', '"')
            data=JSON.parse(ret);
            $.cookie('userid', data._id, { expires: 7, path: '/' })
            $.cookie('username', username, { expires: 7, path: '/' })
            $.cookie('password', password, { expires: 7, path: '/' })
            console.log($.cookie('userid'),$.cookie('username'), $.cookie('password'),)
            window.location.href = "items.html";
        },
        error: function (err){
            console.log('登录失败')
        }
    })
}

function checkCookie(){
    let user = $.cookie('username')
    if (user === undefined){
        window.location.href = 'login.html'
    }else {
        console.log(user)
    }
}