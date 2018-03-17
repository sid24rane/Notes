document.addEventListener('DOMContentLoaded',function(){
var reset = document.getElementById("reset");
reset.addEventListener('submit', function (e) {
    e.preventDefault();
    var userid = document.forms.reset.lastElementChild.getAttribute("data-id");
    var pass1 = document.forms.reset.pass.value;
    var pass2 = document.forms.reset.cpass.value;
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/reset/";
    xhr.open('POST', url, true);
    var data = 'pass='+pass1+'&pass2='+pass2+'&userid='+userid;
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(xhr.status==200){
            alert('Password changed successfully!!');
            }else if(xhr.status==404){
            alert('Password doesnt match!!');
            }else{
            alert('Error!!');
            }
        }
    }
});    
    
});



