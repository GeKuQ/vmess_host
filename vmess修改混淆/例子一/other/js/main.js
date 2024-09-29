function sub_to_mlsub() {
        document.getElementById("id4").value = jz();
        document.getElementById("id5").value = mls();
        Copy();
    } //原始订阅转换

function jz() {
    var url = document.getElementById("url").value;
    url = encodeURIComponent(url);
    var host = document.getElementById("host").value;
    if (url === ""||host === "") {
        alert("必填不能为空！");
    }else{
    var mlurl = "https://api.orangeapi.org/sub?suburl=" + url + "&newhost=" + host;
    return mlurl;
    }
}

function mls() {
    var url = document.getElementById("url").value;
    url = encodeURIComponent(url);
    var host = document.getElementById("host").value;
    var name = document.getElementById("name").value;
    var port = document.getElementById("port").value;
    if (url === ""||host === "") {
        alert("必填不能为空！");
    }else{
    var mlurl = "http://zhuan.mlsao.ml/auto/?url=http%3A%2F%2Fzhuan.mlsao.ml%2Fsub%2F%3Fair_url%3D" + url + "%26host%3D" + host;
    if (!!document.getElementById("name").value) {
        mlurl += "%26addname%3D" + name;
    } //备注
    if (!!document.getElementById("port").value) {
        mlurl += "%26ports%3D" + port;//多端口筛选
    }
    return mlurl;
    }
}

function Copy() {
    var Url2 = document.getElementById("id4");
    if (!Url2){
        Url2.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        alert("已复制好，可贴粘。");
    }
}