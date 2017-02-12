function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function buildPayload(tickets, boundry, csrf, csvLine)
{
	var ret = tickets.replace(/%boundry%/g, boundry);
	ret+='\n------WebKitFormBoundary' + boundry + '\n'+
		'Content-Disposition: form-data; name="csrfhash"\n' +
		csrf + '\n' + 
		'------WebKitFormBoundary' + boundry + '--';
	var retParsed = ret;
	var i;
	for(i=0;i<csvLine.split(",").length;i++)
	{
		var re = new RegExp("%"+i.toString()+"%");
		retParsed = retParsed.replace(re, csvLine.split(",")[i]);
	}
	return retParsed;
}

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function getCSRFhash(theUrl)
{
	var html = httpGet(theUrl);
	var token = html.split('csrfhash" value="')[1].split('"')[0];
	return token;
}

function uploadTickets()
{
	var i;
	var ticketInfo = document.getElementById("tickets");
	var ticketInputInfo = document.getElementById("csv");
	var csvi = ticketInputInfo.value;
	var ticketi = ticketInfo.value;
	for(i=0;i<csvi.split('\n').length;i++)
	{
		//alert(csvi.split('\n')[i]);
		var csfr = getCSRFhash("http://esupport.ctdlc.org/staff/index.php?/Tickets/Ticket/NewTicketForm");
		var http = new XMLHttpRequest();
		var url = "http://esupport.ctdlc.org/staff/index.php?/Tickets/Ticket/NewTicketSubmit/user";
		var rnd = randomString(16);
		var params = buildPayload(ticketi, rnd, csfr, csvi.split('\n')[i]);
		http.open("POST", url, false);
		http.setRequestHeader("Content-type", "multipart/form-data; boundary=----WebKitFormBoundary"+rnd);
		http.send(params);
		alert(http.responseText);
		//if(!http.requestText.includes('SetHeaderTitle("[#')) { alert("Could not create ticket at line: " + i.toString()); }
	}
	alert("Done");
}

document.addEventListener('DOMContentLoaded', function() {
  var ticketUploadBtn = document.getElementById("mtu");
  var templ = document.getElementById("template");
  var tempta = document.getElementById("tickets");
  tempta.value = templ.innerHTML;
  ticketUploadBtn.addEventListener('click', function() {
	uploadTickets();
  });
}, false);