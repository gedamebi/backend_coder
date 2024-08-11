const socket = io();

const btnLogin = document.querySelector('#btnLogin');
const txtHeader = document.querySelector('.chat-header');
const chatFooter = document.querySelector('.chat-footer');

let user = '';

btnLogin.addEventListener('click', async function() {
    const { value: nickname } = await Swal.fire({
    title: "Ingrese nickname",
    input: "text",
    inputLabel: "Para ingresar al chat identificarse",
    showCancelButton: true,
    inputValidator: (value) => {
        if (!value) {
            return "You need to write something!";
        }
    }
    });
    if (nickname) {
        user = nickname
        txtHeader.innerText = 'Bienvenido ' + user
        socket.emit('nuevoUsuario',{ user });
        chatFooter.innerHTML = '';
        const inputSendText = document.createElement('input');
        inputSendText.type = 'text';
        inputSendText.className = 'form-control';
        inputSendText.placeholder = 'Escribe un mensaje...';
        inputSendText.id = 'inputSendText';
        chatFooter.appendChild(inputSendText);

        inputSendText.addEventListener('keyup', function(event) {
            if(event.key === 'Enter'){
                socket.emit('mensaje',{ user, mensaje: event.target.value })
                inputSendText.value = ''
            }
        });
    }
});


socket.on('conversacion',(data) => {
    const contenedorChat = document.querySelector('.chat-body');
    contenedorChat.innerHTML = ''
    data.forEach(chat => {
        const div = document.createElement('div');
        const nombre = document.createElement('p');
        const mensaje = document.createElement('p');
        nombre.innerText = chat.user === user ? 'Yo ' + chat.date : chat.user + ' ' + chat.date;
        nombre.classList.add('bold_name');
        mensaje.innerText = chat.mensaje;
        mensaje.classList.add('mensaje_chat');
        div.appendChild(nombre);
        div.appendChild(mensaje);
        contenedorChat.appendChild(div);
    })     
});

function notifyServerAboutDisconnect() {
    socket.emit('desconectarUsuario', { user });
}

window.addEventListener('beforeunload', () => {
    if (user !== ''){
        notifyServerAboutDisconnect();
    }
    socket.emit('disconect', {});
});
