document.addEventListener('DOMContentLoaded',function(){
var post = document.getElementById("editnote");
post.addEventListener('submit', function (e) {
    e.preventDefault();
    var noteid = this.getAttribute("data-id");
    var title = document.forms.editnote.title.value;
    var body = document.forms.editnote.desc.value;
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/notes/edit/" + noteid;
    xhr.open('PUT', url, true);
    var data = 'title='+title+'&desc='+body;
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (xhr.status == 200 && xhr.readyState == 4) {
            window.location.href="http://localhost:3000/notes";
        }
    }
});    
    
});



