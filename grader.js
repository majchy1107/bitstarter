var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var rest = require('restler');
var util = require('util');

var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com"

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.",instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile  = function(htmlfile) {
        return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var outChecks = function(htmlfile,checksfile) {
    var checkJson = checkHtmlFile(htmlfile,checksfile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}


if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_file>','URL',clone(assertFileExists),URL_DEFAULT)
        .parse(process.argv);
    if (program.url) {
	rest.get(program.url).on('complete',function(result,response) {
	    if (result instanceof Error) {
		console.error('Error');
	    } else {
		fs.writeFileSync(filecheck, result);
		outChecks(filecheck,program.checks);
		fs.unlink(filecheck, function(error) {
			if (error) throw error;
		    });
	    }});
    } else {
	outChecks(program.file,program.checks);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
