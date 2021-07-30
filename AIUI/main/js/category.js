
const category = {
    "top": ["Anorak(带帽防寒短上衣)", "Blazer(西装外套)", "Blouse(宽松的衬衫)", "Bomber(飞行员夹克)", "Button-Down(按钮式衬衫)", "Cardigan(开襟衫)", "Flannel(法兰绒上衣)", "Halter(三角背心)", "Henley(无领上衣)", "Hoodie(连帽衫)", "Jacket(夹克)", "Jersey(紧身衣)", "Parka(派克大衣)", "Peacoat(双排扣大衣)", "Poncho(斗篷、披风)", "Sweater(毛衣)", "Tank(无袖上衣)", "Tee(T恤)", "Top(上衣)", "Turtleneck(高领衫)"],
    "bottom": ["Capris(女紧身裤)", "Chinos(斜纹棉布裤)", "Culottes(女裙裤)", "Cutoffs(拼接款)", "Gauchos(南美牛仔)", "Jeans(牛仔裤)", "Jeggings(牛仔样式打底紧身裤)", "Jodhpurs(骑马裤,短马靴)", "Joggers(慢跑裤)", "Leggings((女式)紧身裤)", "Sarong(马来群岛土人所穿的围裙,布裙)", "Shorts(短裤)", "Skirt(短裙,(连衣裙、外衣等的)下摆)", "Sweatpants(运动裤)", "Sweatshorts(运动短裤)", "Trunks((男式)游泳裤)"],
    "coat": ["Caftan(有腰带的长袖衣服)", "Cape(披肩;斗篷)", "Coat(外套)", "Coverup(罩衫)", "Dress(连衣裙)", "Jumpsuit(连衣裤)", "Kaftan(土耳其式长衫)", "Kimono(和服)", "Nightdress(睡衣)", "Onesie(连体衣)", "Robe(长袍)", "Romper(背心连裤子的衣服)", "Shirtdress(衬衫式连衣裙)", "Sundress(太阳裙)"]
}
let maxPage

function onload(){
    $.each(['top', 'bottom', 'coat'], function (i, d){
        $.each(category[d], function (j, c){
            $('#' + d).append('<li class="nav-item"><a href="?category='+c.split('(')[0]+'&page=1" class="nav-link">'+c+'</a></li>')
        });
    });
    getMaxPage(getUrlParam('category'))
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function getMaxPage(category){
    $.ajax({
        url: baseUrl + 'api/search/maxpage',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify({
            'category': category
        }),
        success: function (data){
            console.log('maxPage, 成功, ', data)
            maxPage = data
        },
        error: function (data){
            console.log('maxPage, 失败, ', data)
            maxPage = 10
        }
    })
}

function getImages(category){
    let page = 0;
    $.ajax({
        url: baseUrl + 'api/search/category',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify({
            'category': category,
            'page': page
        }),
        success: function (data){
            console.log('images, 成功, ', data)
        },
        error: function (data){
            console.log('images, 失败, ', data)
        }
    })
}

function generateImage(image){

}