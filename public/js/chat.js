const socket = io()

// Elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // Grab new message element - last one in list
    const $newMessage = $messages.lastElementChild

    // Grab margin bottom of new message element, then height of new message element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Grab visible height
    const visibleHeight = $messages.offsetHeight

    // Grab total height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    // code below will change the sidebar html to what we just compiled
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable form
    $messageFormButton.setAttribute('disabled', 'disabled')


    // alternative way to get the message, instead of using querySelector
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
   // disable button
   $sendLocationButton.setAttribute('disabled', 'disabled')
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {


            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enable button
            $sendLocationButton.removeAttribute('disabled')

            console.log('Location shared!!!!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated', (count) => {
//     console.log('Count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('cliccccked')
//     socket.emit('increment')
// })