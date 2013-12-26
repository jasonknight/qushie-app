var db = Qushie.createDatabaseObject();
if ( db.open('Aardwolf.db') ) {
	console.log("Opened DB");
	if ( db.create("SELECT * FROM sqlite_master WHERE type = :type") ) {
		console.log("Statement Prepared");
		db.bind({ type: "table" });
		if ( db.run() ) {
			console.log("Statement Executed");
			var result = db.next();
			while ( ! $.isEmptyObject(result) ) {
				console.log("Result is: ", result);
				result = db.next();
			}
			db.finish();
		} else {
			console.log("Statement could not be executed");
		}
	} else {
		console.log("Failed to prepare statement", db.lastError());
	}
} else {
	console.log("Failed to open", db.lastError());
}
