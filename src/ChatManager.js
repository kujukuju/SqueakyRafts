var ChatManager = function() {
};

// this must match the value in ServerBlobEntity
ChatManager.MESSAGE_TIME = 20 * 1000;

// this must match the value in ServerBlobEntity
ChatManager.MESSAGES_PER_TIME = 6;

// this must match the html maxlength and ServerBlobEntity values
ChatManager.MAX_MESSAGE_LENGTH = 240;

// must be lower case list
// must match the word filter in the server
ChatManager.PROFANITY_FILTER_LIST = [
    'nigger',
    'faggot',
    'fag',
];

ChatManager.TOO_MANY_MESSAGES_ERROR = 'You\'re sending too many messages!';
ChatManager.TOO_LONG_ERROR = 'Your message is too long to send!';

ChatManager.chatContainerElement = null;
ChatManager.chatInputElement = null;
ChatManager.chatSayElement = null;

ChatManager.focusCheckTimeout = null;
ChatManager.isFocused = false;

ChatManager.mousePosition = [0, 0];

ChatManager.sentTimes = [];

ChatManager.profanityFilter = false;

ChatManager.visible = false;

ChatManager.onBottom = false;

ChatManager.receivedMessage = function(entityID, message) {
    if (!entityID) {
        ChatManager.chatServer(message);
        return;
    }

    let entity = EntityInformation.getEntity(entityID);
    if (!entity) {
        return;
    }

    if (ChatManager.profanityFilter) {
        for (let i = 0; i < ChatManager.PROFANITY_FILTER_LIST.length; i++) {
            const word = ChatManager.PROFANITY_FILTER_LIST[i];
            const replacement = '*'.repeat(word.length);
            let lowerCaseMessage = message.toLowerCase();

            let index = null;
            while ((index = lowerCaseMessage.indexOf(word)) !== -1) {
                message = message.substring(0, index) + replacement + message.substring(index + word.length);
                lowerCaseMessage = message.toLowerCase();
            }
        }
    }

    let username = entity.username;
    let color = '000000';

    let emote = false;
    if (message.toLowerCase().substring(0, 3) === '/me') {
        message = message.substring(3);
        emote = true;
    }

    ChatManager.printMessage(username, color, message, color, emote);
};

ChatManager.printMessage = function(username, color, message, textColor, emote) {
    textColor = textColor || '000000';
    emote = !!emote;

    if (emote) {
        textColor = color;
    }

    emote = emote || !username;

    ChatManager.testOnBottom();

    let chatLineElement = document.createElement('div');
    chatLineElement.classList.add('chatLine');

    let usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.style.color = '#' + color;
    usernameElement.innerText = username + (emote ? '' : ':');

    let textElement = document.createElement('div');
    textElement.classList.add('text');
    if (emote) {
        textElement.classList.add('emote');
        textElement.style.color = '#' + textColor;
    } else if (textColor) {
        textElement.style.color = '#' + textColor;
    }
    textElement.innerText = message;

    chatLineElement.appendChild(usernameElement);
    chatLineElement.appendChild(textElement);

    ChatManager.chatContainerElement.appendChild(chatLineElement);

    ChatManager.correctOnBottom();
};

ChatManager.sendMessage = function(message) {
    const entity = EntityInformation.getClientEntity();
    if (ChatManager.canSend(message) && entity) {
        ChatManager.sentTimes.push(Date.now());

        Packets.writeChatPacket(entity.id, message);
        ChatManager.clear();
    }

    ChatManager.chatInputElement.blur();
};

ChatManager.canSend = function(message) {
    let time = Date.now() - ChatManager.MESSAGE_TIME;
    while (ChatManager.sentTimes.length > 0 && ChatManager.sentTimes[0] <= time) {
        ChatManager.sentTimes.shift();
    }

    let messageCountTest = ChatManager.sentTimes.length < ChatManager.MESSAGES_PER_TIME;
    let tooLongTest = message.length <= ChatManager.MAX_MESSAGE_LENGTH;
    let emptyTest = message.length > 0;
    if (!tooLongTest) {
        ChatManager.chatError(ChatManager.TOO_LONG_ERROR);
    }
    if (!messageCountTest) {
        ChatManager.chatError(ChatManager.TOO_MANY_MESSAGES_ERROR);
    }

    return messageCountTest && tooLongTest && emptyTest;
};

ChatManager.chatError = function(error) {
    ChatManager.printMessage('Error', 'd75656', error, 'd75656');
};

ChatManager.chatServer = function(message) {
    ChatManager.printMessage('Server', '493318', message, '493318');
};

ChatManager.clear = function() {
    ChatManager.chatInputElement.value = '';
};

ChatManager.clearChat = function() {
    while (ChatManager.chatContainerElement.hasChildNodes()) {
        ChatManager.chatContainerElement.removeChild(ChatManager.chatContainerElement.lastChild);
    }
};

ChatManager.checkFocus = function() {
    ChatManager.visible = !MainMenu.mainMenuVisible;
    if (ChatManager.visible && ChatManager.chatParentElement.style.display === 'none') {
        ChatManager.chatParentElement.style.display = 'block';
    }
    if (!ChatManager.visible && ChatManager.chatParentElement.style.display === 'block') {
        ChatManager.chatParentElement.style.display = 'none';
    }

    if (!ChatManager.visible) {
        return;
    }

    ChatManager.focusCheckTimeout = null;

    let focus = document.activeElement === ChatManager.chatInputElement;
    let boundingBox = ChatManager.chatParentElement.getBoundingClientRect();
    let width = ChatManager.mousePosition[0] >= boundingBox.left && ChatManager.mousePosition[0] < boundingBox.right;
    let height = ChatManager.mousePosition[1] >= boundingBox.top && ChatManager.mousePosition[1] < boundingBox.bottom;
    if (focus || (width && height)) {
        ChatManager.focus();
    } else {
        ChatManager.blur();
    }
};

ChatManager.focusInput = function() {
    if (!ChatManager.visible) {
        return;
    }

    ChatManager.chatInputElement.focus();
};

ChatManager.focus = function() {
    if (ChatManager.isFocused) {
        return;
    }
    ChatManager.isFocused = true;

    ChatManager.chatParentElement.classList.add('hover');
    ChatManager.chatContainerElement.classList.add('hover');
    ChatManager.chatSayElement.classList.add('hover');
};

ChatManager.blur = function() {
    if (!ChatManager.isFocused) {
        return;
    }
    ChatManager.isFocused = false;

    ChatManager.chatParentElement.classList.remove('hover');
    ChatManager.chatContainerElement.classList.remove('hover');
    ChatManager.chatSayElement.classList.remove('hover');
};

ChatManager.testOnBottom = function() {
    let scrollPosition = ChatManager.chatContainerElement.pageYOffset || ChatManager.chatContainerElement.scrollTop;
    let offsetHeight = ChatManager.chatContainerElement.offsetHeight;
    let maxScrollPosition = ChatManager.chatContainerElement.scrollHeight;
    ChatManager.onBottom = Math.abs((scrollPosition + offsetHeight) - maxScrollPosition) < 4;
};

ChatManager.correctOnBottom = function() {
    if (!ChatManager.onBottom) {
        return;
    }

    ChatManager.chatContainerElement.scrollTop = ChatManager.chatContainerElement.scrollHeight;
};

ChatManager.resize = function() {
    ChatManager.onBottom = true;
    ChatManager.correctOnBottom();
};

ChatManager.initialize = function() {
    ChatManager.chatParentElement = document.getElementById('chat-parent');
    ChatManager.chatContainerElement = document.getElementById('chat-container');
    ChatManager.chatInputElement = document.getElementById('chat-input');
    ChatManager.chatSayElement = document.getElementById('chat-say');

    ChatManager.chatInputElement.onkeydown = function(e) {
        if (e.key.toLowerCase() === Input.KEY_ENTER) {
            ChatManager.sendMessage(ChatManager.chatInputElement.value.trim());
        }

        return true;
    };

    window.addEventListener('mouseup', function(e) {
        if (e.target.tagName.toLowerCase() !== 'input') {
            ChatManager.chatInputElement.blur();
        }
    });

    window.addEventListener('mousemove', function(e) {
        if (!ChatManager.focusCheckTimeout) {
            ChatManager.mousePosition = [e.clientX, e.clientY];
        }
    });

    window.addEventListener('touchstart', function(e) {
        let touches = e.changedTouches;

        ChatManager.mousePosition = [touches[touches.length - 1].clientX, touches[touches.length - 1].clientY];
    }, false);

    window.addEventListener('touchcancel', function(e) {
        let touches = e.changedTouches;

        ChatManager.mousePosition = [touches[touches.length - 1].clientX, touches[touches.length - 1].clientY];
    }, false);

    window.addEventListener('resize', function(e) {
        ChatManager.resize();
    });

    setInterval(ChatManager.checkFocus, 40);
};