/**
 * Validate email function with regular expression
 * 
 * If email isn't valid then return false
 * 
 * @param email
 * @return Boolean
 */
// function validateEmail(email){
// 	var emailReg = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
// 	var valid = emailReg.test(email);
// 
// 	if(!valid) {
//         return false;
//     } else {
//     	return true;
//     }
// }

$("document").ready(function(){
		$("#cform").submit(function(){
		var to      = $("#cffn").html() + '.' + $('#cfln').html() + '@polimi.it';
		var toname  = $("#cffn").html() + ' ' + $('#cfln').html();
		var comment = $("cform_comments").html();
		var from    = $("cform_email").html();
		var fname   = $("cform_name").html();
		
		
		var data = {
			"action"    : "sendemail",
			"from_email": from,
			"from_name" : fname,
			"to_email"  : to,
			"to_name"   : toname,
			"cc_email"  : "CC:EMAIL",
			"cc_name"   : "CC NAME",
			"subject"   : "Online Client Request",
			"html"      : comment
		};
		data = $(this).serialize() + "&" + $.param(data);
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "http://cis-mobileapp.deib.polimi.it/extmail/response.php",
			data: data,
			headers: {
				"X-Requested-With": "XMLHttpRequest"
			},
			crossDomain: true,
			success: function(data) {
// 				alert("success: " + data["mailstatus"]);
				var status = data["mailstatus"];
				if (status >= 0) {
					$("#cform_message").attr('class', 'alert alert-success');
					$("#cform_message").html(
						  "<strong>Well done!</strong> You successfully send the message!"
					);
				} else {
					$("#cform_message").attr('class', 'alert alert-danger');
					$("#cform_message").html(
						"<strong>Oh snap!</strong> Change a few things up and try submitting again."
					);
				}
				// alert("Form submitted successfully.\nReturned json: " + data["json"]);
			},
			error: function(data) {
				alert("error: " + data["status"]);
				$("#cform_message").attr('class', 'alert alert-danger');
				$("#cform_message").html(
					"<strong>Something really bad has happened!!</strong>"
				);
			}
		});
		return false;
	});
});

