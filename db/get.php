<?php
	if($_GET["mode"] === "getCalendar")
	{
		require_once('connect.php');
		$emailid = $_GET["email"];
		$queryUser = mysql_query("select u.id, u.username, u.email, u.calendar_id from user u where u.email = '$emailid'");
		if(mysql_num_rows($queryUser) === 1)
		{
			$row = mysql_fetch_assoc($queryUser);
			$uid = $row['id'];
			$username = $row['username'];
			$calendar_id = $row['calendar_id'];
			
			$user = array(
								"id" => $uid,
								"username" => $username,
								"calendar_id" => $calendar_id,
								"user_present" => true
		
							);
			$jsonString =  json_encode($user);
			echo $jsonString;

		}
		else
		{
			$user = array(								
							"user_present" => false
		
							);
			$jsonString =  json_encode($user);
			echo $jsonString;
		}
		require_once('disconnect.php');
	}
	else if($_GET["mode"] === "getStudentList")
	{
		require_once('connect.php');
		#get id of the person for which email is to be excluded
		$queryUser = mysql_query("select u.id, u.username, u.email, u.calendar_id from user u");
		if(mysql_num_rows($queryUser))
		{
			$i = 0;
			echo "<ul style = 'list-style-type:none;background-color:white;width:80%;margin:0;padding:0'>";
			while ($row = mysql_fetch_assoc($queryUser))
			{
				$username = $row['username'];
				$email = $row['email'];
				$userid = $row['id'];							
				echo "<input type = 'hidden' id = 'hiddenUserId$i' value = '$userid' />";
				echo "<label><input type = 'checkbox' id = 'chckboxUserSelect$i' /> $username <br />< $email ></label><br /><hr />";				
				echo "</li>";
				$i = $i + 1;
				
			}
			echo "</ul>";
			echo "<input type = 'hidden' id = 'hiddenNoOfUsers' value = '$i' />";

		}
		
		require_once('disconnect.php');
	}
	else if($_GET["mode"] === "getStudentDetails")
	{
		require_once('connect.php');
		$groupId = $_GET["groupId"];
		$queryStudentDetails  = mysql_query("select u.id, u.username, u.email, u.calendar_id from user u where u.id in(
									select ugm.user_id from user_group_mapping ugm where ugm.group_id = $groupId)");	
		$numOfStudents = mysql_num_rows($queryStudentDetails);
		$arrayDetails = array("length" => $numOfStudents);
		
		$i = 0;
		while($row = mysql_fetch_assoc($queryStudentDetails))
		{
			$arrayDetails[strval($i)] = array(  "id" => $row['id'],
												"username" => $row['username'],
												"email" => $row['email'],
												"calendar_id" => $row['calendar_id']);
										
			$i = $i + 1;
		}
		
		$jsonString =  json_encode($arrayDetails);
		echo $jsonString;
		require_once('disconnect.php');
		
	}
	else if($_GET["mode"] === "groups")
	{
		require_once('connect.php');
		$userId = $_GET["userid"];
		$queryGroups = mysql_query("select g.id, g.group_name, g.owner_id from `group` g where g.owner_id = $userId");
		
		echo "<select id = 'selectGroup'>";												
											
		while($row = mysql_fetch_assoc($queryGroups))
		{
			$groupId = $row['id'];
			$groupName = $row['group_name'];
			echo "<option value = '$groupId'>$groupName</option>";
		}
		
		echo "</select>";
		require_once('disconnect.php');
	}
	else if($_GET["mode"] === "groupList")
	{
		require_once('connect.php');
		$userId = $_GET["userid"];
		$queryGroups = mysql_query("select g.id, g.group_name, g.owner_id from `group` g where g.owner_id = $userId");
		echo "List of groups<br />";
		echo "<ul style = 'list-style-type:none'>";												
											
		while($row = mysql_fetch_assoc($queryGroups))
		{
			$groupId = $row['id'];
			$groupName = $row['group_name'];
			echo "<li>$groupName</li>";
		}
		
		echo "</ul>";
		require_once('disconnect.php');
	}
	else if($_GET["mode"] === "getEventDetails")
	{
		require_once('connect.php');
		$eventId = $_GET["eventId"];
		
		$queryEvent = mysql_query("select *, (select u.email from user u where u.id = e.tutor_id) as tutor_email from event e where e.id = $eventId");
		if(mysql_num_rows($queryEvent))
		{
			$row = mysql_fetch_assoc($queryEvent);
			$arrayEvent = array("eventName" => $row['event_name'],
								"startTime" => $row['start_time'],
								"endTime" => $row['end_time'],
								"tutorId" => $row['tutor_id'],
								"tutorEmail" => $row['tutor_email'],
								"groupId" => $row['group_id'],
								"broadcastToken" => $row['broadcast_token'],
								"chatToken" => $row['chat_token'],
								"fileId" => $row['file_id']);
			$jsonString =  json_encode($arrayEvent);
			echo $jsonString;
		}
		require_once('disconnect.php');
	}
?>
