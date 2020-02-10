var selectedTri = 1; //Trimester defaults to 1
var dates = { //Dates for all years, manually added
	"2019": {
		"1": {
			start: "03/04/19", //Format: MM/DD/YY
			end: "06/07/19"
		},
		"2": {
			start: "07/08/19",
			end: "10/11/19"
		},
		"3": {
			start: "11/11/19",
			end: "02/14/20"
		}
	},
	"2020": {
		"1": {
			start: "03/02/20", //Format: MM/DD/YY
			end: "06/05/20"
		},
		"2": {
			start: "07/06/20",
			end: "10/09/20"
		},
		"3": {
			start: "11/09/20",
			end: "02/12/21"
		}
	}
};

function parseClasses(allocatorSource) {
	var classes = $(".TimetableName:contains('Trimester " + selectedTri + "')", $(allocatorSource)).parent(); //Parse source and select the appropriate classes from the selected trimester
	var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	var output = [];
	
	
	classes.find("div[class='TimetableDay']").each(function() {
		var dayElement = $(this);
		
		dayElement.find(".Activity").each(function() {
			var currentClass = {};
			var rawName = $(this).find(".Name").text().split("-");
			
			currentClass.day = days.indexOf(dayElement.find("span[class='TimetableDay']").text());
			currentClass.startTime = $(this).find(".StartDescription").text();
			currentClass.endTime = $(this).find(".EndDescription").text();
			currentClass.room = $(this).find(".Activity_LocationsName").text();
			currentClass.name = rawName[0];
			
			if (rawName.length > 2) { //If tutorial or lab the name will have 3 components seperated by a dash ("COMP261-12345-Tut/01"), otherwise only 2 ("COMP261-12345")
				currentClass.name = currentClass.name + " " + rawName[2].split("/")[0];
			}
			
			output.push(currentClass);
		});	
	});
	
	return output;
}

function buildCalendar(allocatorSource) {
	var cal = ics();
	var classes = parseClasses(allocatorSource);
	var tri = dates[new Date().getFullYear()][selectedTri];
	
	for (var i = 0; i < classes.length; i++) {
		var currentClass = classes[i];
		var rrule = {};
		
		rrule.freq = "WEEKLY";
		rrule.until = tri.end;
		
		//Reference for adding days to a date: https://stackoverflow.com/questions/563406/add-days-to-javascript-date
		var start = new Date(tri.start + " " + currentClass.startTime);
		start.setDate(start.getDate() + currentClass.day);
		
		var end = new Date(tri.start + " " + currentClass.endTime);
		end.setDate(end.getDate() + currentClass.day);
		
		//Name, description, place, start, end, rrule
		cal.addEvent(currentClass.name, currentClass.startTime + " - " + currentClass.endTime, currentClass.room, start, end, rrule);
	}
	
	return cal;
}

function parse() {
	buildCalendar($("#input").val()).download("Allocator-T" + selectedTri + "-" + new Date().getFullYear());
}

function updateTrimester(tri) {
	selectedTri = tri;
}