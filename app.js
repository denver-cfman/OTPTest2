( function () {
	var otpJSON = '';
	var otpJSONoBj;
	window.addEventListener( 'tizenhwkey', function( ev ) {
		if( ev.keyName === "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0],
				pageid = page ? page.id : "";
			if( pageid === "main" ) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	} );
	setInterval(timer, 1000);
} () );

var otpJSON = [{"type":"totp","name":"Google","secret":"JBSWY3DPEHPK3PXP"},
               {"type":"totp","name":"Home PAN","secret":"JBSWY3DPEHPK3PXP"},
               {"type":"totp","name":"Thycotic","secret":"JBSWY3DPEHPK3PXP"},
               {"type":"totp","name":"DreamHost","secret":"JBSWY3DPEHPK3PXP"},
               {"type":"totp","name":"AWS Sec Account","secret":"JBSWY3DPEHPK3PXP"},
               {"type":"totp","name":"AWS MY Account","secret":"JBSWY3DPEHPK3PXP"}]

//console.log('otpJSON: ' + otpJSON[0].name);
//console.log('MyID: ' + tizen.application.getCurrentApplication().appInfo.id);

$.each( otpJSON, function( key, value ) {
	  console.log('value: ' + value.name);
	  console.log('value: ' + value.secret);
	  $("#ui-listview").append('<li class="ui-listitem" id="otpItem'+key+'"><a href="#"><span class="otpName" id="otpName'+key+'">' + value.name + '</span><br/><span class="otpSec" id="otpSec'+key+'">Please Wait ...</span></a></li>');
});

$( ".otpName" ).css( "font-size", "large" );
//$( ".otpSec" ).css( "font-size", "large" );

/*
var dir = tizen.filesystem;
var otpJSONFile = '/opt/apps/' + tizen.application.getCurrentApplication().appInfo.id + '/data';
console.log('otpJSONFile: ' + otpJSONFile);

function isFileThere(inFullPath){
	tizen.filesystem.resolve(
			inFullPath, 
		      function(fd){
		      var filehandler=fd;
		       fd.openStream(
		               "r",
		               function(fs){
		                var data = fs.read(filehandler.fileSize);
		                fs.close();
		                return true;
		               }, function(e) {
		                 console.log(" Error " + e.message);
		                 return false;
		               }, "UTF-8"
		           );      
		      }, function(e)  {
		        console.log(" Error " + e.message);
		        return false;
		      }, "r"
		  );
}

function touchFile(inFullPath){
	
	tizen.filesystem.resolve(
				inFullPath, 
		       function(dir){
		        dir.createFile('otpLIST.json');
		       }, function(e) {
		         console.log("Error" + e.message);
		       }, "rw"
		   );
	
}

var isThere = isFileThere(otpJSONFile + '/otpLIST.json');
console.log('Is The File There?   ' + isThere);
if (isThere === "undefined"){
	touchFile(otpJSONFile + '/otpLIST.json');
}

*/

function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
function hex2dec(s) { return parseInt(s, 16); }

function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";

    for (var i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }

    for (var i = 0; i+4 <= bits.length; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;

} // base32tohex

function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
} //leftpad

function updateOtp(inSecret) {
        
    var key = base32tohex(inSecret);
    var epoch = Math.round(new Date().getTime() / 1000.0);
    var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');

    var shaObj = new jsSHA("SHA-1", "HEX");
    shaObj.setHMACKey(key, "HEX");
    shaObj.update(time);
    var hmac = shaObj.getHMAC("HEX");
    var offset = hex2dec(hmac.substring(hmac.length - 1));
    var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
    otp = (otp).substr(otp.length - 6, 6);
    return otp;
}// updateOtp

function timer()
{
var epoch = Math.round(new Date().getTime() / 1000.0);
var countDown = 30 - (epoch % 30);
	if(countDown > 0 && countDown < 5){
		$('a').css('color', '#ff0000');
	}else{
		$('a').css('color', '#00ff00');
	}
	if (epoch % 30 == 0) {
		$.each( otpJSON, function( key, value ) {
			$('#otpSec' + key).text(updateOtp(otpJSON[key].secret));
		});
	}
  $('#updatingIn').text(countDown);
} // timer
