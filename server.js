const http = require('http');

const startServer = () => {
  http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.write('Hello World!');
    res.end();
  }).listen(8080);
  console.log("Server is listening on 127.0.0.1:8080");
};

scrapper.fetchStatusPage("2010-06-12")
  .then(res => console.log(scrapper.parseStatusPage(res)))
  .catch(err => console.log(err));