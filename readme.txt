*the file staffroute.js is the one supposed to be run , under routes.
the server is listening to port 1000.
the token is displayed after you login and should be inserted in the header under key = "x-auth-token" .

Functionality:login with unique username and password
Route: /staff/login
Request type: POST
Request body: { “email” : “hi22”, "password”: “123456” }
-------------------------
Functionality: logout
Route: /staff/logout
Request type: POST
-------------------------
Functionality: get profile
Route: /staff/profile
Request type: GET
Response: returns the whole document example:
{
    "requests": [],
    "notifications": [
        "new replacement request, id:5fe5eb2915fc36496ca1f02f"
    ],
    "_id": "5fde1ea94ec44225f0c9f32b",
    "password": "$2a$10$f0nMkgp6O5Ukh0e9A4FSsu4BwC5QIjDKJWsseVn2oEAqBL8OoeSsm",
    "email": "hi22",
    "name": "name",
    "salary": 1000,
    "officelocation": "officelocation",
    "role": "academicmember",
    "department": "1",
    "id": "test",
    "__v": 1
}
--------------------------------------------------
Functionality: reset password
Route: /staff/changePassword
Request type: POST
Request body: { "newPassword": “anystring” }
--------------------------------------------------
Functionality: sign in
Route: /staff/signin
Request type: POST
Request body: { "month": "1","day":"2" }
--------------------------------------------------
Functionality:hr adds location
Route: /staff/hr/addLocation
Request type: POST
Request body: "room":"c3 101","roomType":"lab","capacity":"25"
--------------------------------------------------
Functionality:hr updates location
Route: /staff/hr/updateLocation
Request type: POST
Request body: "currentname":"c3 101","newname":"c3 102","type":"classroom","capacity":"24"
--------------------------------------------------
Functionality:hr deletes a location
Route: /staff/hr/deleteLocation
Request type: DELETE
Request body:"room":"c3 102"
--------------------------------------------------
Functionality:hr adds a faculty
Route: /staff/hr/addFaculty
Request type: POST 
Request body:"name":"Engineering","departments":["met","dmet"]
--------------------------------------------------
Functionality:hr updates a faculty
Route: /staff/hr/updateFaculty
Request type: POST 
Request body:"name":"Engineering","newname":"Engineering","newdepartments":["mecha","production"]
--------------------------------------------------
Functionality:hr deletes a faculty
Route: /staff/hr/deleteFaculty
Request type: DELETE 
Request body:"name":"Engineering"
--------------------------------------------------
Functionality:hr deletes a department
Route: /staff/hr/deleteDepartment
Request type: DELETE 
Request body:"facname":"Engineering","name":"met"
--------------------------------------------------
Functionality:hr adds a course
Route: /staff/hr/addCourse
Request type: POST 
Request body:"courseID":"cs","depart":"met"
--------------------------------------------------
Functionality:hr updates a course
Route: /staff/hr/updateCourse
Request type: POST 
Request body:"newCourseID":"cs 101","courseID":"cs"
--------------------------------------------------
Functionality:hr deletes a course
Route: /staff/hr/deleteCourse
Request type: DELETE 
Request body:"depart":"met","courseID":"cs"
--------------------------------------------------
Functionality:hr adds a staff member
Route: /staff/hr/addStaff
Request type: POST
Request body:"id":"hr-1ahmed","name":"ahmed","email":"ahmed@student.guc.edu.eg","salary":"1000","role":"hr","personalinfo":"any"
--------------------------------------------------
Functionality:hr updates staff member info
Route: /staff/hr/updateStaff
Request type: POST
Request body:"id":"hr-1ahmed","newofficelocation":"c3 101","newemail":"ahme11d@student.guc.edu.eg","newsalary":"1000","role":"hr"
,"email":"ahmed@student.guc.edu.eg"
--------------------------------------------------
Functionality:hr deletes staff memberr 
Route: /staff/hr/deleteStaff
Request type: DELETE
Request body:"id":"hr-1ahmed"
--------------------------------------------------
Functionality:hr updates staff memberr salary
Route: /staff/hr/updateSalary
Request type: POST
Request body:"id":"hr-1ahmed","newsalary":"100000"
--------------------------------------------------
Functionality:HOD assigns a Course instructor
Route:/staff/hod/assignCourseinstructor
Request type: POST
Request body:"id":"test","courseID":"cs"
--------------------------------------------------
Functionality:HOD deletes a Course instructor
Route:/staff/hod/deleteCourseinstructor
Request type: DELETE
Request body:"id":"test","courseID":"cs"
--------------------------------------------------
Functionality:HOD updates a Course instructor
Route:/staff/hod/updateCourseinstructor
Request type: POST
Request body:"id":"test","courseID":"cs"
--------------------------------------------------
Functionality:HOD views his department staff
Route:/staff/hod/viewdepartmentstaff
Request type: GET
Response: returns all department members' documents example :
staff ID : newid21
staff name : name
email : teso
department : undefined
days off: sunday
personal info : undefined
office location: officelocation
--------------------------------------------------
Functionality:HOD views course staff
Route:/staff/hod/viewcoursestaff
Request type: GET
Request body:"courseID":"cs"
Response: returns all course members' documents example :staff ID : newid21
staff name : name
email : test
department : test
days off: sunday
personal info : test
office location: test
---------------------------------------------------
Functionality:hod views days off
Route:/staff/hod/viewdaysoff
Request type: GET
Request body:"view":"1" ,"id":"test"   //to get single member's day off input view ="1" to get all members ignore view
---------------------------------------------------
Functionality:hod views requests
Route:/staff/hod/viewrequests
Request type: GET
Response : returns all request documents that have receiver = this specific hod example :
{
        "_id": "5fe3d22c1a1625dd5c98eb15",
        "requesttype": "changeDayOff",
        "sender": "newid21",
        "receiver": "test",
        "newDayoff": "sunday",
        "status": "rejected"
    },
    {
        "_id": "5fe5cc04e35336b66ee98328",
        "requesttype": "replacement",
        "sender": "newid21",
        "receiver": "test",
        "newDayoff": "sunday",
        "status": "pending"
    },
    {
        "_id": "5fe5eae215fc36496ca1f02e",
        "sender": "test",
        "receiver": "test",
        "requesttype": "replacement",
        "status": "pending",
        "__v": 0
    },

---------------------------------------------------
Functionality:hod accepts requests
Route:/staff/hod/acceptrequest
Request type: POST
Request body: "reqid":"5fe5eb2915fc36496ca1f02f" //we get the reqid from the view requests function for hod
---------------------------------------------------
Functionality:hod rejects requests
Route:/staff/hod/rejectrequest
Request type: POST
Request body: "reqid":"5fe5eb2915fc36496ca1f02f" //we get the reqid from the view requests function for hod
---------------------------------------------------
Functionality:instructor views teaching assignments 
Route:/staff/instructor/viewteachingassignment
Request type: GET
Response:gets all documents for specific course
Request body:"courseID":"cs"
---------------------------------------------------
Functionality:instructor views department staff
Route:/staff/instructor/viewdepartmentstaff
Request type: GET
Response:gets all staff documents for specific course example :
staff ID : newid21
staff name : name
email : test
department : 1
days off: sunday
personal info : test
office location: test
---------------------------------------------------
Functionality:instructor assigns course coordinator
Route:/staff/instructor/assigncoursecoordinator
Request type:POST
Request body:"id":"test","courseID":"test"
---------------------------------------------------
Functionality:coordinator views linking requests
Route:/staff/coordinator/viewlinkingrequests
Request type:GET
Response example:{"_id":{"$oid":"5fe5f2210f313383c031088f"},"requesttype":"slotLinking","status":"pending","receiver":"test","sender":"test","__v":{"$numberInt":"0"}}
---------------------------------------------------
Functionality:coordinator accepts linking requests
Route:/staff/coordinator/acceptlinking
Request type:POST
Request body:"reqid":"5fe5f2210f313383c031088f","comment":"anything"
---------------------------------------------------
Functionality:coordinator rejects linking requests
Route:/staff/coordinator/rejectlinking
Request type:POST
Request body:"reqid":"5fe5f2210f313383c031088f","comment":"anything"
---------------------------------------------------
Functionality:academic member sends replacement requests
Route:/staff/academicmember/sendreplacementrequest
Request type:POST
Request body:"receiver":"test"
---------------------------------------------------
Functionality:academic member views replacement requests
Route:/staff/academicmember/viewreplacementrequests
Request type:GET
Response example:{
        "_id": "5fe5cc04e35336b66ee98328",
        "requesttype": "replacement",
        "sender": "newid21",
        "receiver": "test",
        "newDayoff": "sunday",
        "status": "pending"
    }

---------------------------------------------------
Functionality:academic member sends linking requests
Route:/staff/academicmember/sendlinkingrequest
Request type:POST
request body:"comment":"anything","receiver":"test","courseID":"cs"
---------------------------------------------------
Functionality:academic member sends change day off requests
Route:/staff/academicmember/sendchangedayoffrequest
Request type:POST
request body:"comment":"anything","newDayoff":"test","courseID":"cs"
---------------------------------------------------
Functionality:academic member sends leave requests
Route:/staff/academicmember/sendleaverequest
Request type:POST
request body:"leavereason":"anything","comment":"test","courseID":"cs"
---------------------------------------------------
Functionality:academic member views notifications
Route:/staff/academicmember/viewnotifications
Request type:GET
Response example : "new replacement request, id:5fe5eb2915fc36496ca1f02f"
---------------------------------------------------
Functionality:academic member views request status
Route:/staff/academicmember/viewrequeststatus
Request type:GET
Request body:"caseofview":"1"  //there are 4 different values for caseofview 1 for accepted requests 2 for rejected 3 for all ,0 for pending 
Response example : {"_id":{"$oid":"5fe3d22c1a1625dd5c98eb15"},"requesttype":"changeDayOff","sender":"newid21","receiver":"test","newDayoff":"sunday","status":"accepted"}
