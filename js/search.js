var st;
var msie = document.documentMode;
if (msie < 10) {
    alert('인터넷 익스플로러 버전이 너무 낮아 페이지가 제대로 작동하지 않을 수 있습니다. 다른 브라우저를 사용해 주시기 바랍니다.');
}

function listItemClick(_id, reset) {
    $.post("/search", {id: _id}, function (result){
        var man=[], id=_id,t=5;
        while(t--){
            for(i = 0; i < result.man.length; i++){
                if(result.man[i].id == id){
                    man.push(result.man[i]);
                    id=result.man[i].dad;
                }
            }
        }

        st = man[0].line;
        $("#panel").html('');
        var width=drawButton(man[man.length-1],man,result,4);
        $("#panel").width(width);
        $("#point").width(width > 709 ? width : 709);
        $("#pf").scrollLeft(width);

        $('#info').html('<tr><th class="head">杏山</th><td class="xwide" colspan="4">'+man[0].line+'世'+'</td></tr>');
        $("#info").append('<tr class="first"><td class="head">譜名</td>'+'<td class="name">'+man[0].name+'</td><td class="name">'+man[0].kor+'</td><td class="head">別稱</td>'+'<td>'+man[0].alias+'</td></tr><tr><td class="head">字</td><td colspan="2">'+man[0].ja+'</td><td class="head">號</td><td>'+man[0].ho+'</td></tr><tr><td class="head">爵位</td><td colspan="4">'+man[0].honor+'</td></tr><tr><td class="head">傳記</td><td colspan="4">'+man[0].record+'</td></tr><tr><td class="head">壽</td><td colspan="4">'+man[0].age+'</td></tr><tr><td class="head">生</td><td colspan="4">'+man[0].birth+'</td></tr><tr><td class="head">卒</td><td colspan="4">'+man[0].death+'</td></tr><tr class="last"><td class="head">墓</td>'+'<td colspan="4">'+man[0].grave+'</td></tr>');

        var wife = [];
        for(i = 0; i < result.wife.length; i++){
            if(result.wife[i].man_id == _id){
                wife.push(result.wife[i]);
            }
        }
        wife.sort(odrCompare);
        $('#wife').html('<tr><th class="head">配位</th><td class="wide"></td></tr>');
        for(i=0;i<wife.length;i++){
            $("#wife").append('<tr class="first"><td class="head">貫鄕</td>'+'<td class="wide">'+wife[i].family+'</td></tr><tr><td class="head">聘家</td>'+'<td class="wide">'+wife[i].home+'</td></tr><tr><td class="head">壽</td>'+'<td class="wide">'+wife[i].age+'</td></tr><tr><td class="head">生</td>'+'<td class="wide">'+wife[i].birth+'</td></tr><tr><td class="head">卒</td>'+'<td class="wide">'+wife[i].death+'</td></tr><tr class="last"><td class="head">墓</td>'+'<td class="wide">'+wife[i].grave+'</td></tr>');
        }

        var dt = [];
        for(i = 0; i < result.daughter.length; i++){
            if(result.daughter[i].man_id == _id){
                dt.push(result.daughter[i]);
            }
        }
        dt.sort(odrCompare);
        $('#dt').html('<tr><th class="head">女壻</th><td class="wide"></td></tr>');
        for(i=0;i<dt.length;i++){
            $("#dt").append('<tr class="first"><td class="head">'+odr[i]+'女</td>'+'<td class="wide">'+dt[i].name+'</td></tr><tr><td class="head">生卒</td>'+'<td class="wide">'+dt[i].birth+'</td></tr><tr><td class="head">出家</td>'+'<td class="wide">'+dt[i].info+'</td></tr><tr class="last"><td class="head">子女</td>'+'<td class="wide">'+dt[i].child+'</td></tr>');
        }

        if(reset == undefined)
            reset = false;
        if(reset){
            var list = document.getElementById('list');
            list.innerHTML = '';
            var a = document.createElement('a');
            a.className = "list-item active";
            a.href = '#';
            a.addEventListener('click', function () {
                listItemClick(man[0].id);
                activeCntl(a);
                return false;
            }, false);
            list.appendChild(a);
            var span = document.createElement('span');
            span.className='line';
            span.appendChild(document.createTextNode(man[0].line));
            a.appendChild(span);
            for(var i=0;i<man.length && i<3;i++){
                span = document.createElement('span')
                span.appendChild(document.createTextNode(man[i].name + '(' + man[i].kor + ')'));
                a.appendChild(span);
            }
            var c = result.clan.filter(function(x) {return x.root_id == man[0].clan})[0];
            if(c!=undefined){
                span = document.createElement('span')
                span.appendChild(document.createTextNode(c.name));
                a.appendChild(span);
            }
        }
    });
}

function makeSon(son) {
    return son.substring(1,son.length-1).split(',');
}

function drawButton(man, mans, result, right) {
    if(3+man.line-st >= 0 && 3+man.line-st < 5)
        makeButton(right, man, mans);
    if(man.son != "{}" && man.son != undefined && mans.indexOf(man) >= 0){
        var sons = makeSon(man.son);
        var sArr = [], gf;
        for(var j=0;j<sons.length;j++) {
            var m = result.man.filter(function(x) {return x.id == sons[j]})[0];
            if (m != undefined) {
                if (m.line == man.line + 1){
                    sArr.push(m);
                }
                else
                    gf = m;
            }
        }
        if(gf==null && sArr.length==0)
            return right+52;

        if(gf!=null){
            drawG(man,gf,right);
            right = drawButton(gf,mans,result,right);//봉사손 그리는거 만들어야 됨
        }
        for (var i=0;i<sArr.length;i++){
            right = drawButton(sArr[i],mans,result,right);
        }
        return right;
    }else
        return right+52;
}

function makeButton(right, m, mans) {
    var panel = document.getElementById("panel");
    var btn = document.createElement("BUTTON");
    panel.appendChild(btn);
    btn.style.right = right + "px";
    btn.style.top = (3 + m.line - st) * 52 + "px";
    btn.addEventListener('click',function () {
        btnClick(m)
    },false);
    btn.classList.add("gray");
    if(mans.indexOf(m)>-1)
        btn.classList.add("highlight");
    for(var i=0;i<mans.length;i++)
        if(mans[i].id==m.dad)
            btn.classList.remove("gray");
    if(m.line==1)
        btn.classList.remove("gray");
    var s = document.createElement("span");
    s.appendChild(document.createTextNode(m.kor));
    btn.appendChild(s);
    s = document.createElement("span");
    s.appendChild(document.createTextNode(m.name));
    btn.appendChild(s);
}

function drawG(m1, m2, right) {
    var panel = document.getElementById("panel");
    for (var i=0;i<m2.line-m1.line-1;i++){
        if((4 + m1.line + i - st) < 0 || (4 + m1.line + i - st) > 4)
            continue;
        var btn = document.createElement("BUTTON");
        panel.appendChild(btn);
        btn.style.right = right + "px";
        btn.style.top = (4 + m1.line + i - st) * 52 + "px";
        btn.addEventListener('click',function () {
            btnClick(m1);
        },false);

        var t = document.createTextNode('奉祀');
        btn.appendChild(t);
    }
}

function btnClick(m) {
    listItemClick(m.id, true);
}

function odrCompare(w1, w2) {
    return w1.odr-w2.odr;
}

function activeCntl(tag) {
    var cur = document.getElementsByClassName("active");
    if(cur.length > 0)
        cur[0].className = cur[0].className.replace(" active", "");
    tag.className += " active";
}

var odr=['長','次','三','四','五','六','七','八','九','十'];