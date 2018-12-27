function setCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == name) {
            return unescape(y);
        }
    }
}

if(getCookie('visited')!='true' && getCookie('noShowToday')!='true'){
    var modal = document.getElementById("modal");
    var close = document.getElementById('close');
    var check = document.getElementById('chbox');
    modal.style.display='block';
    close.onclick=function(){
        modal.style.display='none';
        if(check.checked==true){
            setCookie('noShowToday','true',1);
        }
        setCookie('visited','true',0);
        location.replace('/');
    }
}