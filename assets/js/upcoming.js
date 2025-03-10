/* global FullCalendar */

const CALENDAR_ID = 'hacksocnotts.co.uk_5m2l3o30k13frs9nd9dmh9rk8o@group.calendar.google.com'
const CALENDAR_KEY = 'AIzaSyBzgsuQnfQ7g_zMSsmll7XosF5ZxpJZaWk'

const END_DATE = '2020-04-13'
const RANGE_UPDATE_INTERVAL = 60 // sec

const DATE_24HR_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
  omitZeroMinute: false,
  hour12: false
}

let calendar
let calendarElement

document.addEventListener('DOMContentLoaded', () => {
  calendarElement = document.querySelector('#calendar')

  calendar = new FullCalendar.Calendar(calendarElement, {
    plugins: ['bootstrap', 'googleCalendar', 'list'],
    defaultView: 'list',
    header: false,
    height: () => { return window.innerHeight },
    defaultDate: new Date(),
    googleCalendarApiKey: CALENDAR_KEY,
    events: {
      googleCalendarId: CALENDAR_ID,
      failure: onLoadFailed
    },
    themeSystem: 'bootstrap',
    eventTimeFormat: DATE_24HR_FORMAT,
    views: {
      // all upcoming events view
      list: {
        listDayFormat: { year: 'numeric', month: 'short', day: '2-digit', omitCommas: true },
        listDayAltFormat: { weekday: 'long' },
        visibleRange: {
          start: new Date(),
          end: '2020-04-12'
        }
      }
    },
    eventClick: (info) => {
      info.jsEvent.preventDefault()
      parent.window.location.href = 'https://hackquarantine.com/schedule'
    },
    eventRender: (info) => {
      try {
        const details = JSON.parse(info.event._def.extendedProps.description)
        info.el.classList.add(`type-${details.type}`)
      } catch (e) {
        console.error('cannot parse event details/ find colour')
      }

      const endTime = info.event._instance.range.end
      const endUnix = endTime.getTime() + (1000 * 60 * endTime.getTimezoneOffset())
      const nowUnix = (new Date()).getTime()
      if (endUnix < nowUnix) {
        // if the event is today but has finished, don't show it
        return false
      }
    }
  })

  setVisibleRange()
  calendar.render()

  setInterval(() => {
    calendar.refetchEvents()
    setVisibleRange()
  }, RANGE_UPDATE_INTERVAL * 1000)
})

function setVisibleRange () {
  calendar.setOption('visibleRange', {
    start: new Date(),
    end: END_DATE
  })
}

function onLoadFailed (error) {
  calendarElement.innerHTML =
    `<div id="calendar-error">
      <h3>Could not load calendar</h3>
      <p>HTTP Error ${error.xhr.status}</p>
    </div>`
}
