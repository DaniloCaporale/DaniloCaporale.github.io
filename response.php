<?php

require_once("class.phpmailer.php");

/***************** FUNCTIONS ************************/
//Function to check if the request is an AJAX request
function is_ajax() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}
/****************************************************/

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 604800');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
	header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
	
	
	header('Access-Control-Allow-Headers: x-requested-with');

	exit(0);
}

if (is_ajax()) {
	if (isset($_POST["action"]) && !empty($_POST["action"])) { //Checks if action value exists
		$action = $_POST["action"];
		switch($action) { //Switch case for value of action
			case "sendemail": sendemail(); break;
		}
	}
}

/*
Sanitize() function removes any potential threat from the
data submitted. Prevents email injections or any other hacker attempts.
if $remove_nl is true, newline chracters are removed from the input.
*/
// function Sanitize($str,$remove_nl=true)
// {
//     $str = $this->StripSlashes($str);
// 
//     if($remove_nl)
//     {
// 	$injections = array('/(\n+)/i',
// 	    '/(\r+)/i',
// 	    '/(\t+)/i',
// 	    '/(%0A+)/i',
// 	    '/(%0D+)/i',
// 	    '/(%08+)/i',
// 	    '/(%09+)/i'
// 	    );
// 	$str = preg_replace($injections,'',$str);
//     }
// 
//     return $str;
// }
// function StripSlashes($str)
// {
//     if(get_magic_quotes_gpc())
//     {
// 	$str = stripslashes($str);
//     }
//     return $str;
// }

 
function sendemail(){
//  $return = $_POST;
  
	$frommail = stripslashes($_POST["cform_email"]);
	$fromname = stripslashes($_POST["cform_name"]);
	$tomail   = stripslashes($_POST["to_email"]);
	$toname   = stripslashes($_POST["to_name"]);
	$subject  = stripslashes($_POST["subject"]);
	$body     = stripslashes($_POST["cform_comments"]);

	$return["frommail"] = $frommail;
	$return["fromname"] = $fromname;
	$return["tomail"] = $tomail;
	$return["toname"] = $toname;
	$return["subject"] = $subject;
	$return["body"] = $body;
	
 
///////////////////// SEND EMAIL ///////////////////////////
       $mail = new PHPMailer;
       $mail->From = $frommail;
       $mail->FromName = $fromname;
       $mail->addAddress($tomail,$toname);

       $mail->WordWrap = 200;                                 // Set word wrap to 50 characters

       $mail->Subject = $subject;
       $mail->Body = $body;
	//SUCCESS
	$return["mailstatus"] = 0;
	
	if (strcmp($tomail, "matteo.pirotta@polimi.it") == 0) {
		$return["mailstatus"] = -1;
	} else {
		if(!$mail->send()) {
			// FAILURE
			$return["mailstatus"] = -1;
		}
	}



//   $return["json"] = json_encode($return);
	echo json_encode($return);
}
?>