const fs = require('fs');
var streamData = fs.readFileSync('./stream.txt', "utf8");
var streamArr = streamData.split(/\n/);
var users = {},
    chatGroups = {},
    universities = {};

streamArr.map(event => {
  var eventArr = event.split("|");
  var type = eventArr[0];

  if (type === "User") {
    users[eventArr[1]] = {name: eventArr[1], university: eventArr[2], role: eventArr[3], chatids: []};
    universities[[eventArr[2]]] = {};
  } else if (type === "ChatGroup") {
    chatGroups[eventArr[1]] = {};
    users[eventArr[2]].chatids.push(eventArr[1]);
    users[eventArr[3]].chatids.push(eventArr[1]);
    universities[users[eventArr[2]].university][eventArr[1]] = chatGroups[eventArr[1]];
  } else if (type === "Message") {
    chatGroups[eventArr[2]][eventArr[4]] = {sender: users[eventArr[1]], text: eventArr[3]}
  }
});

//Main function: average response time for all mentors at specific university
function uniResponseTime(uniName, universities) {
  var sum = 0;
  var count = 0;

  for (var university in universities) {
    if (university === uniName) {
      var chats = universities[university];

      for (var id in chats) {
        var messages = chats[id];
        var prevRole;
        var prevTime;

        for (var time in messages) {
          var currRole = messages[time].sender.role;
          var currTime = toSecs(time.split(" ")[1]);

          if (prevRole === "Applicant" && currRole === "Mentor") {
            sum += (currTime - prevTime);
            count++;
          }

          prevRole = currRole;
          prevTime = toSecs(time.split(" ")[1]);
        }
      }
    }
  }

  var avgHours = sum/3600/count;
  var avgMins = sum/60/count;

  return count === 0 ? "We don't have enough data from "+uniName+" university." : ["Mentors from",uniName,"take an average of",avgHours,"hours (or",avgMins,"minutes) to respond to an applicant's message."].join(" ");
}

//Helper function: splits time, converts to seconds
function toSecs(time) {
  return time.split(":").reduce((a, b, i) => {
    var multiple = (i === 0) ? 3600: (i === 1) ? 60: 1;

    return a + (parseInt(b) * multiple);
  }, 0);
}

console.log(uniResponseTime("Edinburgh", universities));
console.log(uniResponseTime("Glasgow", universities));
