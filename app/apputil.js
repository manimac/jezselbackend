const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');
const MODELS = require("./models");
const UserDetailModel = MODELS.userDetails;

const apiKey = '4de239d21a197cead36c21be9d305466';
const apiSecret = 'ad7ba52f89e6fc3eeab86cfe08baaf9e';
var smsglobal = require('smsglobal')(apiKey, apiSecret);

var jwtSecret = 'tportalsecret';
exports.jwtSecret = jwtSecret;

var registerStatus = [
    { id: 1, value: "Registration" },
    { id: 2, value: "Appointment Fixed" },
    { id: 3, value: "Application Collected" },
    { id: 4, value: "Application Submitted" },
    { id: 5, value: "In Progress" },
    { id: 6, value: "Approved by Goverment" },
    { id: 7, value: "Licence updated" },
    { id: 0, value: "Application Rejected" },
];

var levelOfRecognition = [
    { "name": "National" },
    { "name": "State" },
    { "name": "District" },
    { "name": "Zonal" }
];
exports.levelOfRecognition = levelOfRecognition;

exports.makeUserDetail = function(body) {
    return new Promise(function(resolve, reject) {
        UserDetailModel.create(body).then(function(result) {
            resolve(result);
        }, function(err) {
            reject(err);
        })
    });
}
exports.updateUserDetail = function(body) {
        return new Promise(function(resolve, reject) {
            UserDetailModel.findOne({
                where: {
                    user_id: body.user_id
                }
            }).then(function(resp) {
                resp.update(body).then(function(result) {
                    resolve(result);
                }, function(err) {
                    reject(err);
                })
            }, function(err) {
                reject(err);
            })

        });
    }
    // Mail configs
var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

// var transporter = nodemailer.createTransport({
//     // host: 'mail.serverboot.in',
//     host: 'fiber4.iaasdns.com',
//     port: 587,
//     auth: {
//         user: "support1@jezsel.nl",
//         pass: "A$+#Vg!ICI"
//     },
//     tls: { rejectUnauthorized: false },
//     // tls: true,
// });

var transporter = nodemailer.createTransport({
    // host: 'smtp.transip.email',
    // port: 587,
    // auth: {
    //     user: "support1@jezsel.nl",
    //     pass: "Luna@2704"
    // },
    // tls: { rejectUnauthorized: false },
    host: 'uranium.da.hostns.io',
    port: 587,
    auth: {
        user: "test@jezsel.nl",
        pass: "test@123"
    },
    tls: { rejectUnauthorized: false },
});

exports.getUser = function(token) {
    let decoded = {};
    try {
        decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (e) {
        console.log(e);
    }
    return decoded;
}

exports.makeRandomText = function(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/** Verification mail */
exports.sendVerificationMail = function(user, password = null) {
    sendVfMail(user, password).catch(console.error);
}
async function sendVfMail(user, password = null) {
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let verifyUrl = `${process.env.baseUrl}user/verification/${user.id}/${user.verification_token}`;
        let comments = `Click the following link to verify your JEZSEL account ${verifyUrl}`;
        var replacements = {
            username: user.firstname + ' ' + user.lastname,
            message: comments,
            message2: '',
        };
        if (password) {
            replacements.message2 = `Your Temporary password: ${password}`;
        }
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL User Verification', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}
/** End of Verification mail */

/** order Confirmation */

exports.sendOrderConfirmationMail = function(order, type) {
    sendOrdConfirmation(order, type).catch(console.error);
    sendOrdConfirmationAdmin(order, type).catch(console.error);
}
async function sendOrdConfirmation(order, type) {
    let user = order && order.user || {};
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `Thank you for choosing us. We value your business. Our’s organization will probably give great items and mindful client assistance to esteemed clients like you. We would like to meet and surpass your desires!`;
        var replacements = {
            username: user.firstname,
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: (type && type == 'wallet') ? 'JEZSEL - Bevestiging opwaardering' : 'JEZSEL Bevestiging boeking', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

async function sendOrdConfirmationAdmin(order, type) {
    let user = order && order.user || {};
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `We have received a new order. Kindly check the admin panel. Order id - ` + order.id;
        var replacements = {
            username: "Admin",
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: ['orders@jezsel.nl'], // list of receivers
            subject: (type && type == 'wallet') ? 'JEZSEL - Bevestiging opwaardering' : 'JEZSEL New Order', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.sendPaymentLink = function(user) {
    main(user).catch(console.error);
}

// async..await is not allowed in global scope, must use a wrapper
async function main(user) {
    // // send mail with defined transport object
    // let verifyUrl = `https://serverboot.in/#/payment/${user.data}`;
    // let detail = {
    //     from: 'support1@jezsel.nl', // sender address
    //     to: user.email, // list of receivers
    //     subject: "JEZSEL Payment link", // Subject line
    //     text: "JEZSEL Payment link", // plain text body
    // }
    // detail.html = `<b>Good day! </b>`;
    // detail.html += `Please click below link to process the payment <br>`;
    // detail.html += `<a href='${verifyUrl}' target='_blank'>Proceed</a><br>Thanks <br> JEZSEL Team`;
    // let info = await transporter.sendMail(detail);
    // return info;
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let verifyUrl = `${process.env.appUrl}payment?oud=${user.data}`;
        let comments = `Click the following link to process the payment ${verifyUrl}`;
        var replacements = {
            username: 'User',
            message: comments,
            message2: '',
        };
        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Betaallink', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return error;
            } else {
                return info;
            }
        })
    })
}

exports.sendOTP = function(phone = null) {
    return new Promise(function(resolve, reject) {
        if (phone) {
            var payload = {
                origin: 'MY ELOAH',
                message: '{*code*} is your MY ELOAH verification code.',
                destination: phone
            };
            // {*code*} placeholder is mandatory and will be replaced by an auto generated numeric code.
            smsglobal.otp.send(payload, function(error, response) {
                if (response) {
                    resolve(response)
                        // verifyOTP();
                }
                if (error) {
                    reject(error)
                }
            });
        } else {
            reject(false);
        }
    })

}

exports.verifyOTP = function(user, code) {
    return new Promise(function(resolve, reject) {
        var id = user.otprequestid; // requestId received upon sending an OTP
        smsglobal.otp.verifyByRequestId(id, code, function(error, response) {
            if (response) {
                resolve(response);
            }
            if (error) {
                reject(error);
            }
        });
    })
}





exports.resetedPassword = function(user, password) {
    return new Promise(async function(resolve, reject) {
        readHTMLFile('./app/mail/email-temp.html', function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: user.firstname + ' ' + user.lastname,
                message: `You have successfully reset the password for your JEZSEL account, Your current password is ${password}`,
                message2: '',
            };


            var htmlToSend = template(replacements);
            let detail = {
                from: 'test@jezsel.nl', // sender address
                to: user.email, // list of receivers
                subject: 'Your JEZSEL Login Password Reseted', // Subject li
                html: htmlToSend
            }

            transporter.sendMail(detail, function(error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        });
    });
}

exports.expireNotification = function(order) {
    let user = order.User
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `Your Service(` + order.id + `) going to expire in 1 Hour`;
        var replacements = {
            username: user.firstname + ' ' + user.lastname,
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Nog één uur - Herinnering', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.cancelNotification = function(user, order) {
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `Your Order was canceled.`;
        var replacements = {
            username: user.firstname + ' ' + user.lastname,
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Annulering', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.withdrawRequest = function(user, status) {
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `Your Withdrawal request was ${status}.`;
        var replacements = {
            username: user.firstname + ' ' + user.lastname,
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: user.email, // list of receivers
            subject: 'JEZSEL Withdrawal Status', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}

exports.subscribeEmail = function(email) {
    readHTMLFile('./app/mail/email-temp.html', function(err, html) {
        var template = handlebars.compile(html);
        let comments = `We have a new Subscriber( ${email} ).`;
        var replacements = {
            username: 'Admin',
            message: comments,
            message2: '',
        };

        var htmlToSend = template(replacements);
        // send mail with defined transport object
        let detail = {
            from: 'test@jezsel.nl', // sender address
            to: 'manimaccse@gmail.com', // list of receivers
            subject: 'JEZSEL New Subscription', // Subject lin
            html: htmlToSend
        }
        transporter.sendMail(detail, function(error, info) {
            if (error) {
                return (error);
            } else {
                return (true);
            }
        })
    })
}