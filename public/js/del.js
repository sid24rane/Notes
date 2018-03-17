document.addEventListener('DOMContentLoaded',function(){
    var del = document.getElementById('delete');
    del.addEventListener('click',function(e){
        e.preventDefault();
        var id =this.getAttribute("data-id");
        var xhr = new XMLHttpRequest();
        var url = "http://localhost:3000/notes/delete/"+id;
        xhr.open('DELETE',url,true);
        xhr.send(id); 
        xhr.onreadystatechange=function(){
            if(xhr.status == 200 && xhr.readyState == 4){
                window.location.href="http://localhost:3000/notes";
            }
        }
    });
});