// Initialize Firebase
var config = {
  apiKey: "AIzaSyDg5URMnT8xf1-KHVLruKlr2xuez3ZfbZg",
  authDomain: "traintest-dcefd.firebaseapp.com",
  databaseURL: "https://traintest-dcefd.firebaseio.com",
  projectId: "traintest-dcefd",
  storageBucket: "",
  messagingSenderId: "966440993383"
};
firebase.initializeApp(config);

var database = firebase.database();

$(document).ready(function() {
  $("#submit-button").on("click", function(event) {
    event.preventDefault();
    var now = moment();

    var name = $("#input-name")
      .val()
      .trim();
    var dest = $("#input-destination")
      .val()
      .trim();
    var freq = parseInt(
      $("#input-frequency")
        .val()
        .trim()
    );

    var startTime = moment(
      $("#input-time")
        .val()
        .trim(),
      "HH:mm"
    ).subtract(1, "years");

    //Clear Values from Form
    $(this)
      .closest("form")
      .find("input[type=text], textarea")
      .val("");

    //Difference in time (in minutes) between train start time (1 year before) and now.
    var diffTime = moment().diff(moment.unix(startTime), "minutes");
    console.log("diffTime", diffTime);

    //find minutes since last train by taking modulo of diffTime and frequency
    var sinceLast = moment().diff(moment.unix(startTime), "minutes") % freq;
    console.log("sincelast", sinceLast);

    //Find out how many minutes until next train (freq-sinceLast);
    var untilNext = freq - sinceLast;
    console.log("untilnext", untilNext);

    //Add untilNext minutes to current time
    var nextTrain = moment()
      .add(untilNext, "minutes")
      .format("HH:mm");
    console.log("nextTrain", nextTrain);

    database.ref().push({
      name: name,
      dest: dest,
      freq: freq,
      nextTrain: nextTrain,
      untilNext: untilNext,
      time: firebase.database.ServerValue.TIMESTAMP
    });
  });//End On-click Fct

  // Firebase watcher + initial load on page
  database.ref().orderByChild("time").on("child_added", function (childSnapshot){
  //database.ref().on("child_added", function(childSnapshot) {
   console.log(childSnapshot.val());
    console.log(childSnapshot.val().name);
    console.log(childSnapshot.val().dest);
    console.log(childSnapshot.val().freq);
    console.log(childSnapshot.val().nextTrain);

    //Unique identifier
    console.log(childSnapshot.key);

    //Create button with unique Firebase identifier data-class
    var removeButton = $("<button>");
    removeButton
      .addClass("btn btn-danger remove-button")
      .attr("type", "button")
      .attr("data-id", childSnapshot.key)
      .attr("data-toggle", "modal")
      .attr("data-target", "warningModal")
      .text("X");

    var buttonContainer = $("<td>");
    buttonContainer.append(removeButton);

    //Create and append a new table row
    var newRow = $("<tr>");
    //COL TRAIN NAME
    newRow
      .append(`<td scope="row">${childSnapshot.val().name}</td>`)
      //COL DESTINATION
      .append(`<td>${childSnapshot.val().dest}</td>`)
      //COL TRAIN FREQUENCY
      .append(`<td>${childSnapshot.val().freq}</td>`)
      //COL NEXT TRAIN
      .append(`<td>${childSnapshot.val().nextTrain}</td>`)
      //Minutes Away
      .append(`<td>${childSnapshot.val().untilNext}</td>`)
      //Add Remove Button into last column of row
      .append(buttonContainer);
    $("tbody").append(newRow);
  });

  $("body").on("click", ".remove-button", function() {
    //Get the unique Firebase key from the button element
    var uniqueKey = $(this).attr("data-id");
    //Remove data node with matching key in Firebase
    database
      .ref()
      .child(uniqueKey)
      .remove();
    //Delete the row locally so page and or firebase doesn't need to be refreshed to show this change in the table
    $(this)
      .closest("tr")
      .remove();
  });
});
