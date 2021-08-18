const socket = io() // making connection to the server


// Elements
const $messageForm = document.querySelector('#sms-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sideBar = document.querySelector('#sidebar-template')


const autoScroll = () => {
  const $newSms = $messages.lastElementChild
  const newSmsStyles = getComputedStyle($newSms)

  const newSmsMargin = parseInt(newSmsStyles.marginBottom)
  const newSmsHeight = $newSms.offsetHeight + newSmsMargin

  const visibleHeight = $messages.offsetHeight

  const containerHeight = $messages.scrollHeight

  const scrollOffSet = $messages.scrollTop + visibleHeight

  if (containerHeight - newSmsHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

//  location event
socket.on('locationMessage', (locationMessage) => {
  const locationMarkup =
      `
    <div class="message">
     <p>
         <span class="message__name">${locationMessage.username}</span>
         <span class="message__meta">${locationMessage.locationCreatedAt}</span>
      </p>
    <p>
        <a target="_blank" href=${locationMessage.location}>My Current location</a>
     </p> 
    </div>
  `
  $messages.insertAdjacentHTML('beforeend', locationMarkup)
  autoScroll()
})

socket.on('welcome', (sms) => {
  const htmlMessage = `
    <div class="message">
      <p>
         <span class="message__name">${sms.username}</span>
         <span class="message__meta">${sms.createdAt}</span>
      </p>
      <p>
        ${sms.text}
      </p>
    </div>
  `
  $messages.insertAdjacentHTML('beforeend', htmlMessage)
  autoScroll()
})

socket.on('roomData', ({room, users}) => {
  $sideBar.innerHTML =
      `
    <h2 class="room-title">${room}</h2>
    <h3 class="list-title">Users</h3>
    <ul class="user">
    ${users.map((user) => {
        return `<li>${user.username}</li></ul> `
      })}
    </ul>
`
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  $messageFormBtn.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage', message, (messageFromServerAcknowledge) => {
    $messageFormBtn.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (messageFromServerAcknowledge) {
      return alert(messageFromServerAcknowledge)
    }
    console.log('The message was delivered')
  })
})

// location
$sendLocationBtn.addEventListener('click', () => {

  // disable btn, and enable only after event happened
  //  send location takes time, so i dont wanna user send it more then 1 while waiting
  $sendLocationBtn.setAttribute('disabled', 'disabled')
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const yourCoords = {}

    // getting coords
    yourCoords.long = position.coords.longitude
    yourCoords.lat = position.coords.latitude


    // sending back location to the server
    socket.emit('sendLocation', yourCoords, (smsFromServerAcknowledge) => {
      $sendLocationBtn.removeAttribute('disabled')
      console.log(smsFromServerAcknowledge)
    })
  })
})


// Options, ignoreQueryPrefix makes ? mark goes away
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.emit('join', {username, room}, (errorMessageFromServerAcknowledge) => {
  if (errorMessageFromServerAcknowledge) {
    alert(errorMessageFromServerAcknowledge)
    // if an error then redirect to main page
    location.href = '/'
  }
})

