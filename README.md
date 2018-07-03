# github-status-tracker
Github Status Tracker is a graphical visualization of GitHub's status history. You can find the statuses updates here : [https://status.github.com/](https://status.github.com/)

## Features
#### Server
It is a node.js server script. It contains a scrapper which loop through all the GitHub's statuses pages (a bot). It grabs every events, events type (Good/Minor/Major) and messages of every statuses updates since the first GitHub update. This script serve the data for the client.

#### Client
The client fetches the data from the server and it parses it. You can sort by year, month or day. You can hide a type of event by clicking on its graph's legend.

You can view the events related to a period by clicking on its bar on the chart. A table appears showing : The dates, the messages and the type of the events. This table can be filtered by the type of event (Good/Minor/Major) and sorted/searchable thanks to DataTable.
## Install
To install this app, you need to download the content of the repository and install the needed dependencies through these commands :

    $ git clone https://github.com/rigwild/github-status-tracker
    $ npm install
You are done ! To start the script just run this :

    $ npm start

And navigate to http://127.0.0.1:8080/.
## Demo
A working demo is available here : [https://github-status-tracker.now.sh/](https://github-status-tracker.now.sh/)

![demo](https://github.asauvage.fr/img/other/github-status-tracker.gif)
## License

This project is licensed under the [MIT](https://github.com/rigwild/github-status-tracker/blob/master/LICENSE) license.