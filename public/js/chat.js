const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input') 
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
      //new message element
      const $newMessage = $messages.lastElementChild

      //height of the last message
      const newMessageStyles = getComputedStyle($newMessage)
      const newmessageMargin = parseInt(newMessageStyles.marginBottom)
      const newMessageHeight = $newMessage.offsetHeight + newmessageMargin
      
      //visible height
      const visibleHeight = $messages.offsetHeight

      //height of message container
      const containerHeight = $messages.scrollHeight

      //how far have i scrolled
      const scrollOffset = $messages.scrollTop + visibleHeight

      if ((containerHeight-newMessageHeight) <= scrollOffset) {
           $messages.scrollTop = $messages.scrollHeight
      }
}

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationTemplate,{
        username:message.username,
         url: message.url,
         createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (message)=> {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room,  users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


document.querySelector('#message-form').addEventListener('submit', (e) =>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled','disabled')


    //disable
    const message = e.target.elements.message.value//another way to select form in html
    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('message is delivered',message)
    })
})

$shareLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('geolocation is not supported')
    } 
    $shareLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
         
       
         socket.emit('position', {
             latitude: position.coords.latitude,
             longitude: position.coords.longitude
            
            }, () => {
                $shareLocationButton.removeAttribute('disabled')
                console.log('location shared')
            })
          
    })
})

socket.emit('join', { username, room}, (error) => {
       if(error) {
           alert(error)
           location.href = '/'
       }
})