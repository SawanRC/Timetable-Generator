# Timetable-Generator

Parses the source from a Student Allocator page and generates a basic .ics calendar with all classes, labs, and tutorials.
The generated file can be imported into calendar applications such as Google Calendar.

**Note**: Trimester dates are currently hardcoded and therefore it is assumed that all classes on the timetable run for the entire trimester. Mid-trimester breaks are currently not implemented (to be added in the future).

This is a Javascript implementation (client side).

https://sawanrc.github.io/Timetable-Generator/index.html

## Updating Trimester dates

Trimester dates are stored in `assets/dates.json`.

Since this won't be running on a server, dates must be directly written to a file.
This means that the dates need to be updated every few years with the new trimester dates.

For convenience, a Python script has been included which will attempt to automatically parse the dates from the online key dates page.
By default, the script will automatically overwrite the contents of the `assets/dates.json` file, but any other directory can be specified with the `--out_file` parameter.

_Example_:
```
python ParseTrimesterDates.py --out_file custom-dir/dates.json
```

<br>

**NOTE**: if using a directory other than the default, you will need to update the following line in `index.html` to accurately reflect this:

```html
<script src="assets/dates.json"></script>
```
