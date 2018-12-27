function pNumCheck() {
    var regExp = /^\d{10,11}$/;
    var val = $('input[name=phone]').val();
    if(!regExp.test(val)){
        alert('전화번호를 확인해 주세요');
        return false;
    }
}