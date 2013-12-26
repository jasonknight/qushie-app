var str = "Hello World!";
var cstr = Qushie.compressString(str);
console.log("Compressed String is", cstr);
var dstr = Qushie.decompressString(cstr);
console.log("Decompressed String is",dstr);