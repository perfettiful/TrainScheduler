// Initialize Firebase
var config = {
  apiKey: "AIzaSyBS6yHT6R4DreGJUVQ2lL-F0L7I_9VyuVM",
  authDomain: "train-schduler-assignment.firebaseapp.com",
  databaseURL: "https://train-schduler-assignment.firebaseio.com",
  projectId: "train-schduler-assignment",
  storageBucket: "train-schduler-assignment.appspot.com",
  messagingSenderId: "125737935191"
};
firebase.initializeApp(config);



var database = firebase.database();

$(document).ready(function () {


    $("#submit-button").on("click", function (event) {
        event.preventDefault();
        var now = moment();

        var name = $("#input-name").val().trim();
        var dest = $("#input-destination").val().trim();
        var freq = parseInt($("#input-frequency").val().trim());

        var startTime = moment(($("#input-time").val().trim()), "HH:mm").subtract(1, "years");

        //Clear Values from Form
        $(this).closest('form').find("input[type=text], textarea").val("");



        //Difference in time (in minutes) between train start time (1 year before) and now.
        var diffTime = moment().diff(moment(startTime), "minutes");
        console.log("diffTime", diffTime);

        //find minutes since last train by taking modulo of diffTime and frequency
        var sinceLast = diffTime % freq;
        console.log("sincelast", sinceLast);

        //Find out how many minutes until next train (freq-sinceLast);
        var untilNext = freq - sinceLast;
        console.log("untilnext", untilNext);

        //Add untilNext minutes to current time
        var nextTrain = moment().add(untilNext, "minutes").format("HH:mm");
        console.log("nextTrain",nextTrain);


        database.ref().push({
            trainName: name,
            destination: dest,
            frequency: freq,
            nextTrain: nextTrain,
            minutesAway: untilNext,
          });

    });


    // Firebase watcher + initial load on page
    database.ref().on("child_added", function(childSnapshot) {

        console.log(childSnapshot.val().trainName);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().frequency);
        console.log(childSnapshot.val().nextTrain);

        //Unique identifier
        console.log(childSnapshot.key);

        //Create button with unique Firebase identifier data-class
        var removeButton = $("<button>");
        removeButton.addClass("btn btn-danger remove-button").attr("type","button").attr("data-id",childSnapshot.key).attr("data-toggle","modal").attr("data-target","warningModal").text("X");

        var buttonContainer = $("<td>");
        buttonContainer.append(removeButton);

        //Create and append a new table row
        var newRow = $("<tr>");

        //COL TRAIN NAME
        newRow.append(`<td scope="row">${childSnapshot.val().trainName}</td>`)
        //COL DESTINATION
        .append(`<td>${childSnapshot.val().destination}</td>`)
        //COL TRAIN FREQUENCY
        .append(`<td>${childSnapshot.val().frequency}</td>`)
        //COL NEXT TRAIN
        .append(`<td>${childSnapshot.val().nextTrain}</td>`)
        //Minutes Away
        .append(`<td>${childSnapshot.val().minutesAway}</td>`)
        //Add Remove Button into last column of row
        .append(buttonContainer);


        $("tbody").append(newRow);


    });

   $("body").on("click",".remove-button", function() {


    //Get the unique Firebase key from the button element
       var uniqueKey = $(this).attr("data-id");

    //Remove data node with matching key in Firebase
       database.ref().child(uniqueKey).remove();

    //Delete the row locally so page and or firebase doesn't need to be refreshed to show this change in the table
       $(this).closest("tr").remove();

   });


});
