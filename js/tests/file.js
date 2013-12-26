$(function () {
	var file = Qushie.createFileObject();
	console.log(file);
	file.SignalBytesRead.connect(function (str) {
		console.log("Read: " + str.length);
		
	});
	file.SignalEndOfFile.connect(function () {
		console.log("End reached");
		file.close();
	});
	file.SignalOpened.connect(function () {
		console.log("Got Opened");
		file.read();
	});
	file.SignalError.connect(function (err) {
		console.log(err);
	});
	file.open("\\\\baldur\\public\\Jason\\Mobtracker.txt","r");

	wfile = Qushie.createFileObject();
	wfile.SignalOpened.connect(function () {
		console.log("Open fired");
		wfile.write("Hello World!\n");
	});
	wfile.SignalBytesWritten.connect(function (i) {
		console.log("Wrote: " + i);
		wfile.close();
	});
	wfile.open("test.txt","w");
});
