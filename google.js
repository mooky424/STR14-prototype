require('dotenv').config();

const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
const {
    time
} = require('console');
const calendarId = process.env.CALENDAR_ID;

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

oAuth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN
});

const calendar = google.calendar({
    version: 'v3',
    auth: oAuth2Client
})

async function viewCalendar(callback) {
    const res = await calendar.calendars.get({
        calendarId: calendarId
    });
    callback(res.data.id);
};

async function viewEvents(upcoming = false, callback) {

    const eventsArray = [];

    const timeMin = new Date();
    const timeMax = new Date();

    if (upcoming) {        
        timeMax.setFullYear(timeMax.getFullYear() + 1);
    } else {
        timeMin.setMinutes(0);
        timeMin.setHours(0);
        timeMax.setMinutes(59);
        timeMax.setHours(23)
    }

    console.log('Viewing events','from', timeMin + "\nto", timeMax);

    const res = await calendar.events.list({
        calendarId: calendarId,
        maxResults: 10,
        orderBy: 'startTime',
        singleEvents: true,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString()
    }).then(res => {

        const data = res.data.items;
        for (i=0;i<data.length;i++) {
            const eventTitle = data[i].summary;
            const eventMeetLink = data[i].hangoutLink;
            const eventStart = data[i].start.dateTime;
            const eventEnd = data[i].end.dateTime;
            eventsArray.push({
                eventTitle,
                eventMeetLink,
                eventStart,
                eventEnd,
            });
        }
        callback(eventsArray);
        console.log('Events viewed');
    });
}

async function findCalendar(title, callback) {

    const res = await calendar.calendarList.list();

    const calendarItems = res.data.items;

    for (let i = 0; i < calendarItems.length; i++) {
        const query = String(title);

        if (query.toLowerCase() === (calendarItems[i].summary).toLowerCase()) {
            const result = calendarItems[i].id;
            callback(result)
        };
    };
}

async function addEvent(eventTitle, eventDescription = undefined, eventStartTime = undefined, eventEndTime = undefined, timeZone = 'Asia/Manila') {

    console.log(`Inserting Event with title ${eventTitle}`);

    if (!eventStartTime) {
        eventStartTime = new Date();
        eventStartTime.setDate(eventStartTime.getDate() + 1);
    }

    if (!eventEndTime) {
        eventEndTime = new Date();
        eventEndTime.setDate(eventEndTime.getDate() + 1);
        eventEndTime.setHours(eventEndTime.getHours() + 1);
    }
        const res = calendar.events.insert({

            calendarId: calendarId,

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
};



function parseDatetoString(s, date, time) {
	const tempDate = new Date(s);
    tempDate.setHours(tempDate.getHours());
	let b = (tempDate.toString()).split(' ');
    const timeTemp = b[4].split(":");
    if (parseInt(timeTemp[0]) > 12) {
        const hour = parseInt(timeTemp.shift())
        timeTemp.unshift((hour-12).toString())
        b[4] = `${timeTemp[0]}:${timeTemp[1]}:${timeTemp[2]} PM`
    } else if (parseInt(timeTemp[0]) < 12) {
        b[4] = `${timeTemp[0]}:${timeTemp[1]}:${timeTemp[2]} AM`
    }
    let returnString;
	if (date && time) {
		returnString = `${b[0]} - ${b[1]} ${b[2]}, ${b[3]} - ${b[4]}`
	} else if (time) {
		returnString = `${b[4]}`
	}
    return returnString;
}

module.exports = {
    addEvent,
    viewEvents,
    viewCalendar,
    parseDatetoString
}