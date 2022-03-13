const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
const {
    time
} = require('console');

require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

oAuth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN
});

const calendar = google.calendar({
    version: 'v3',
    auth: oAuth2Client
})

async function viewCalendar(calendarId) {
    const res = await calendar.calendars.get({
        calendarId: calendarId
    });

    console.log(res.data);
};

async function viewEvents(date = null) {

    const timeMin = new Date();
    const timeMax = new Date();

    if (date){
        timeMin.setDate(date.getDate());   
        timeMax.setDate(date.getDate())     
    } 
    timeMin.setMinutes(0);
    timeMin.setHours(0);
    timeMax.setMinutes(59);
    timeMax.setHours(23)

    console.log(timeMin,timeMax);

    const res = await calendar.events.list({
        calendarId: '2s5p6fl194vtq7ulk0951r2q9s@group.calendar.google.com',
        // maxResults: 10,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString()        
    }).then(res => {

        console.log(res.data.items);

    });
}

async function findCalendar(title) {

    const res = await calendar.calendarList.list();

    const calendarItems = res.data.items;

    for (let i = 0; i < calendarItems.length; i++) {
        const query = String(title);

        if (query.toLowerCase() === (calendarItems[i].summary).toLowerCase()) {
            const result = calendarItems[i].id;
            return result;
        };
    };
}

async function addCalendar(calendarId) {
    const res = calendar.calendarList.insert({
        "colorRgbFormat": false,
        "resource": {
            "id": calendarId
        }
    });

    console.log(res.data);
}

async function createCalendar(title) {
    const res = await calendar.calendars.insert({
        requestBody: {
            summary: title
        }
    })

    console.log('Successfully created calendar with title ', res.data.summary);
}



async function addEvent(eventTitle, eventDescription = undefined, eventStartTime = undefined, eventEndTime = undefined, timeZone = 'Asia/Manila', calendarTitle = 'Notif Test') {

    console.log('Inserting Event');

    if (!eventStartTime) {
        eventStartTime = new Date();
        eventStartTime.setDate(eventStartTime.getDate() + 1);
    }

    if (!eventEndTime) {
        eventEndTime = new Date();
        eventEndTime.setDate(eventEndTime.getDate() + 1);
        eventEndTime.setHours(eventEndTime.getHours() + 1);
    }

    findCalendar(calendarTitle).then((calId) => {

        const res = calendar.events.insert({

            calendarId: calId,

            requestBody: {
                summary: eventTitle,
                description: eventDescription,
                start: {
                    dateTime: eventStartTime,
                    timeZone: timeZone
                },
                end: {
                    dateTime: eventEndTime,
                    timeZone: timeZone
                }
            }
        }).then(res => {
            console.log('Request Status:', res.status);
        })
    })
};



module.exports = {
    addEvent
}