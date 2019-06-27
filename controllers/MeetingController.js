var MeetingRequest = require('../models/MeetingRequest');
const { validationResult } = require('express-validator/check');
var commonUtility = require('../utility/CommonUtility');
const socketConfig = require('../config/socket_config');

module.exports.meetingRequest= (req,res)=> {
    const errors=validationResult(req);
    let flag=errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let meetRequest = new MeetingRequest();
    meetRequest.organizerEmail = req.body.organizerEmail;
    meetRequest.participantEmail = req.body.participantEmail;
    meetRequest.meetingDate = req.body.meetingDate;
    meetRequest.startTime = req.body.startTime;
    meetRequest.endTime = req.body.endTime;
    meetRequest.location = req.body.location;
    meetRequest.agenda = req.body.agenda;
    meetRequest.status="y";
    
    meetRequest.save(function(err) {
        if (err){
            console.log(err);
            res.send({
                status: 'E',
                error: [
                    {
                        msg: "Error"
                    }
                ]
            });
        }
        else {
            res.send({
                status:'C',
                message: "Meeting has been generated"
            });
            commonUtility.sendMail(meetRequest.participantEmail, meetRequest.organizerEmail,
                'Automom: Meeting has been scheduled', 
                "Hey,<br><br>Your meeting has been scheduled. Please join the meeting.<br>Meeting Title –  "
                +meetRequest.agenda+"<br>Invited By – "+meetRequest.organizerEmail+"<br>Date – "
                +meetRequest.meetingDate.toLocaleDateString()+"<br>Start Time – "
                +meetRequest.startTime.toLocaleTimeString()+"<br> End Time – "+meetRequest.endTime.toLocaleTimeString()
                +"<br>Location – "+meetRequest.location+"<br><br>Thanks,<br>Team AutoMoM.");
        }
    });
}

module.exports.meetingList= (req,res)=> {

    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let email = req.body.email;
    MeetingRequest.find({
        $or: [
            {organizerEmail: email},
            {participantEmail: {$elemMatch:{$eq: email}}}
        ]},{ "_id": 1, "organizerEmail": 1, "participantEmail":1, "meetingDate":1, "startTime":1,
         "endTime":1, "location":1, "agenda":1, "status":1, "token":1,"conversation":1}, function(err, meetings) {
        if (err){
            res.send({
                status:'E',
                error: [
                    {
                        msg: "Some error occured."
                    }
                ]
            });
        }
        else if(meetings.length==0){
            res.send({
                status:'E',
                error: [
                    {
                        msg: "There are no meetings for this user."
                    }
                ]
            });
        }
        else {
            res.send({
                status:"C",
                meetings:meetings
            });
        }
    });
}

//update meeting
module.exports.updateMeeting = function(req,res) {

    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let operation = req.params.operation;

    let query;
    if (operation === "cancel"){
        query = {$set:{'status' : 'n'}};
    } 
    else if(operation === "update"){
        query = req.body;
    }

    MeetingRequest.findOneAndUpdate({$and: [{_id: {$eq: req.body.id}}, {status: 'y'}]},query,{ returnNewDocument: true },function(err, meeting){
        if (err) {
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            });
        }
        else if (meeting == null){
            res.send({
                status:"E",
                error: [
                    {
                        msg: "No active meetings found by this ID"
                    }
                ]
            });
        }
        else{
            res.send({
                status:"C",
                message: 'Success'
            });
            //send email to organiser and participant
            if(operation === "cancel"){
                commonUtility.sendMail(meeting.participantEmail, meeting.organizerEmail,
                    'Automom: Meeting has been cancelled', 
                    "Hey,<br><br>Your meeting has been cancelled.<br>Meeting Title –  "+meeting.agenda+"<br>Invited By – "
                    +meeting.organizerEmail+"<br>Date – "+meeting.meetingDate.toLocaleDateString()+"<br>Start Time – "
                    +meeting.startTime.toLocaleTimeString()+"<br> End Time – "+meeting.endTime.toLocaleTimeString()
                    +"<br>Location – "+meeting.location+"<br><br>Thanks,<br>Team AutoMoM.");
                    
            }
            else {
                commonUtility.sendMail(meeting.participantEmail, meeting.organizerEmail,
                    'Automom: Meeting has been re-scheduled', 
                    "Hey,<br><br>Your meeting has been re-scheduled. Please join the meeting.<br>Meeting Title –  "
                    +meeting.agenda+"<br>Invited By – "+meeting.organizerEmail+"<br>Date – "
                    +meeting.meetingDate.toLocaleDateString()+"<br>Start Time – "+meeting.startTime.toLocaleTimeString()
                    +"<br> End Time – "+meeting.endTime.toLocaleTimeString()+"<br>Location – "+meeting.location
                    +"<br><br>Thanks,<br>Team AutoMoM.");
                
            }
        }        
    })
}

updateStatusAndTriggerMail = (id, res) => {
    MeetingRequest.findOneAndUpdate({$and:[{_id: id}, {status: 'y'}]}, {$set : {"status":'e'}}, function(err, meeting){
        if(err) {
            console.log(err);
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            })
        }  
        else if (meeting == null){
            res.send({
                status:"E",
                error: [
                    {
                        msg: "No active meetings found by this ID"
                    }
                ]
            })
        }
        else {
            let content = "";
            meeting.conversation.sort(function(a, b){return a.timestamp - b.timestamp});
            meeting.conversation.forEach(element => {
                content+= "["+element.timestamp.toISOString().replace(/T/, ' ').replace(/\..+/, '')+"] "
                +element.sender+" : "+element.message+".<br>";
            });
            commonUtility.sendMail([meeting.organizerEmail], null, "Minutes of Meeting(MOM)",
            "Hi all,<br><br>Meeting Details:<br>Meeting Title –  "+meeting.agenda+"<br>Invited By – "
            +meeting.organizerEmail+"<br>Date – "+meeting.meetingDate.toLocaleDateString()+"<br>Start Time – "
            +meeting.startTime.toLocaleTimeString()+".<br>Below is the minutes of meeting:<br><br>"+content
            +"<br><br>Thanks,<br>Team AutoMoM.");
            res.send({
                status:"C",
                message:"Success"
            });
        }
    });
}

async function flushData (id, res){
    //flush all remaining messages in the queue to database
    await socketConfig.flushMessagesToDb(id);
    await updateStatusAndTriggerMail(id, res);
}

module.exports.endMeeting = function(req, res) {
    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    flushData(req.body.id, res);
}

module.exports.getMeetingById = function(req,res) {
    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    MeetingRequest.findOne({_id : req.params.meetingId}, function(err, meeting){
        if(err) {
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            });
        } else {
            res.send({'meeting data': meeting});
        }
    });
}