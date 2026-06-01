function SendRequest() {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      var response = JSON.parse(request.responseText);

      var div = document.getElementById("content");
      for (var elem of response) {
        div.innerHTML += elem["id"] + " " + elem["title"] + "<br>";
      }
    } else {
    }
  };
  var method = "get";
  var url = "https://jsonplaceholder.typicode.com/posts";
  var async = true;

  request.open(method, url, async);
  request.send();
}
