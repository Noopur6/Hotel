var MeetingRequest = require('../models/MeetingRequest');
const { validationResult } = require('express-validator/check');
var commonUtility = require('../utility/CommonUtility');

module.exports.createVirtualRoom = (req,res) => {
    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let tokenFromClient = req.body.token;
    MeetingRequest.findOneAndUpdate({$and:[{_id: req.body.id}, {status: 'y'}]},{$set:{token:tokenFromClient}},{ returnNewDocument: true },
        function (err, meeting) {
            if(err){
                res.send({
                    status:"E",
                    error: [
                        {
                            msg: err
                        }
                    ]
                });
            }
            else if(meeting == null){
                res.send({
                    status:"E",
                    error: [
                        {
                            msg: "No meeting found by this Id."
                        }
                    ]
                });
            }
            else{
                res.send({
                    status:"C",
                    message:"Success"
                });
                //send email to organiser and participant
                commonUtility.sendMail( [meeting.participantEmail, meeting.organizerEmail], null,
                    'Automom: Token for the meeting', "Hey,<br><br>Please login to AutoMoM and enter below token to join the meeting. "+
                    "<br><br><h3>"+tokenFromClient+"</h3><br><br>Thanks,<br>Team AutoMoM");
            }
        });
}

module.exports.joinVirtualRoom = (req, res) => {
    //validations
    const errors = validationResult(req);
    let flag = errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let id = req.body.id;
    let token = req.body.token;
    let email = req.body.email;
    MeetingRequest.findOne({
        $and:[{_id: id}, {token: token}, {
            $or: [
                {organizerEmail: email},
                {participantEmail: {$elemMatch:{$eq: email}}}
            ]}]}, function(err, meeting) {
        if (err){
            console.log(err);
            res.send({
                status:"E",
                error: [
                    {
                        msg: "Some error occured"
                    }
                ]
            });
        }
        else if(meeting == null){
            res.send({
                status:"E",
                error: [
                    {
                        msg: "No meeting found."
                    }
                ]
            });
        }
        else {
            res.send({
                status:"C",
                message : "Success"
            });
        }
    });

}