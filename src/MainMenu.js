class MainMenu {
    static mainMenuElement;
    static usernameElement;
    static musicElement;
    static mainMenuVisible = true;
    static voiceChatEnabled = false;
    static musicEnabled = localStorage.getItem('music') !== 'disabled';
    static username = '';
    static twitchStreamElement;
    static streamOnline = false;
    static embedStream;
    static steamElement;
    static linksElement;

    static aBottomLargeElement;
    static aBottomSmallElement;
    
    static initialize() {
        MainMenu.mainMenuElement = document.getElementById('main-menu');
        MainMenu.usernameElement = document.getElementById('username');
        MainMenu.musicElement = document.getElementById('music-hover');
        MainMenu.twitchStreamElement = document.getElementById('twitch-embed');
        MainMenu.steamElement = document.getElementById('steam');
        MainMenu.aBottomLargeElement = document.getElementById('squeakyrafts-io_728x90');
        MainMenu.aBottomSmallElement = document.getElementById('squeakyrafts-io_320x100');

        MainMenu.linksElement = document.getElementById('links');
        const linksMoreElement = document.getElementById('links-more');
        const linksCloseElement = document.getElementById('links-close');
        linksMoreElement.onclick = () => {
            if (MainMenu.linksElement.classList.contains('open')) {
                MainMenu.linksElement.classList.remove('open');
            } else {
                MainMenu.linksElement.classList.add('open');
            }
        };
        linksCloseElement.onclick = () => {
            if (MainMenu.linksElement.classList.contains('open')) {
                MainMenu.linksElement.classList.remove('open');
            } else {
                MainMenu.linksElement.classList.add('open');
            }
        };

        const voiceChatElement = document.getElementById('voice-chat-hover');
        voiceChatElement.onclick = () => {
            MainMenu.voiceChatEnabled = !MainMenu.voiceChatEnabled;

            if (MainMenu.voiceChatEnabled) {
                if (!MicInput.requested) {
                    MicInput.initialize();
                }
                voiceChatElement.classList.add('enabled');
            } else {
                voiceChatElement.classList.remove('enabled');
            }
        };

        const playElement = document.getElementById('play-hover');
        playElement.onclick = () => {
            MainMenu.mainMenuVisible = false;
            MainMenu.username = MainMenu.usernameElement.value.trim();
            if (MainMenu.username.length > 16) {
                MainMenu.username.length = 16;
            }
            
            if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                const spaceCharCode = ' '.charCodeAt(0);
                const tabCharCode = '\t'.charCodeAt(0);
                for (let index = 0; index < MainMenu.username.length; index++) {
                    while (index > 0 && (MainMenu.username.charCodeAt(index - 1) !== spaceCharCode && MainMenu.username.charCodeAt(index - 1) !== tabCharCode) && index < MainMenu.username.length) {
                        index += 1;
                    }

                    // now the index is a valid location for checking profanity
                    for (let len = 1; len < ChatManager.extremeLongestProfanity && index + len <= MainMenu.username.length; len++) {
                        while (index + len + 1 <= MainMenu.username.length && MainMenu.username.charCodeAt(index + len) !== spaceCharCode && MainMenu.username.charCodeAt(index + len) !== tabCharCode) {
                            len += 1;
                        }

                        // now we have the length of a word that ends with a space
                        const currentWord = MainMenu.username.substring(index, index + len).toLowerCase();
                        if (ChatManager.extremeProfanityFilterSet[currentWord]) {
                            const replacement = '*'.repeat(currentWord.length);
                            MainMenu.username = MainMenu.username.substring(0, index) + replacement + MainMenu.username.substring(index + currentWord.length);
                        }
                    }
                }
            }
        };

        MainMenu.musicElement.onclick = () => {
            MainMenu.musicEnabled = !MainMenu.musicEnabled;

            if (MainMenu.musicEnabled) {
                localStorage.removeItem('music');
                MainMenu.musicElement.classList.remove('enabled');
                AudioInformation.currentMainMenuMusic.play();
            } else {
                localStorage.setItem('music', 'disabled');
                MainMenu.musicElement.classList.add('enabled');
                AudioInformation.currentMainMenuMusic.stop();
            }
        };

        if (!MainMenu.musicEnabled) {
            MainMenu.musicElement.classList.add('enabled');
        }
        
        MainMenu.embedStream = new Twitch.Embed('actual-embed', {
            width: 480,
            height: 270,
            muted: true,
            autoplay: true,
            layout: 'video',
            channel: 'kujukuju',
            // only needed if your site is also embedded on embed.example.com and othersite.example.com
            parent: ['iogames.space', 'titotu.ru', 'iogames.fun', 'titotu.io', 'yandex.ru', 'io.games', 'io-games.io', 'games.crazygames.com', 'crazygames.com'],
        });
        MainMenu.embedStream.addEventListener(Twitch.Player.OFFLINE, event => {
            MainMenu.twitchStreamElement.style.display = 'none';
            MainMenu.streamOnline = false;
            MainMenu.resize();
        });
        MainMenu.embedStream.addEventListener(Twitch.Player.ONLINE, event => {
            MainMenu.twitchStreamElement.style.display = 'block';
            MainMenu.streamOnline = true;

            const quality = MainMenu.embedStream.getQualities().sort((a, b) => a.bitrate - b.bitrate)[0].name;
            MainMenu.embedStream.setQuality(quality);

            MainMenu.resize();
        });

        MainMenu.resize();
        MainMenu.refreshContent();
    }

    static update() {
        if (Input.keys[Input.KEY_ESCAPE] & Input.DELTA_DOWN) {
            this.mainMenuVisible = !this.mainMenuVisible;
        }

        if (this.mainMenuVisible) {
            if (MainMenu.mainMenuElement.style.display !== 'block') {
                MainMenu.mainMenuElement.style.display = 'block';
                MainMenu.usernameElement.value = MainMenu.username;

                MainMenu.twitchStreamElement.classList.add('visible');
                MainMenu.steamElement.style.display = 'block';
                MainMenu.linksElement.style.display = 'block';

                MainMenu.aBottomLargeElement.classList.remove('playing');
                MainMenu.aBottomSmallElement.classList.remove('wrongsize');

                MainMenu.refreshContent();
                MainMenu.resize();

                if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                    window.CrazyGames.SDK.game.gameplayStop();
                }
            }
        } else {
            if (MainMenu.mainMenuElement.style.display !== 'none') {
                MainMenu.mainMenuElement.style.display = 'none';

                MainMenu.twitchStreamElement.classList.remove('visible');
                MainMenu.steamElement.style.display = 'none';
                MainMenu.linksElement.style.display = 'none';
                MainMenu.embedStream.setMuted(true);

                MainMenu.aBottomLargeElement.classList.add('playing');
                MainMenu.aBottomSmallElement.classList.add('wrongsize');

                if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                    window.CrazyGames.SDK.game.gameplayStart();
                }
                
                if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                    const callbacks = {
                        adFinished: () => {
                            NSWA.setVolume(1);
                        },
                        adError: (error) => {
                            NSWA.setVolume(1);
                        },
                        adStarted: () => {
                            NSWA.setVolume(0);
                        },
                    };

                    window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
                }
            }
        }

        const entity = EntityInformation.getClientEntity();
        if (entity) {
            Packets.writeUsernamePacket(entity.id, MainMenu.username);
        }
    }

    static isOpen() {
        return this.mainMenuVisible;
    }

    static resize() {
        if (window.innerHeight > window.innerWidth) {
            MainMenu.twitchStreamElement.classList.add('vertical');
            MainMenu.steamElement.classList.add('vertical');
        } else {
            MainMenu.twitchStreamElement.classList.remove('vertical');
            MainMenu.steamElement.classList.remove('vertical');
        }

        if (window.innerWidth >= 970) {
            MainMenu.aBottomLargeElement.classList.remove('wrongsize');
            MainMenu.aBottomSmallElement.classList.add('wrongsize');
        } else {
            MainMenu.aBottomLargeElement.classList.add('wrongsize');
            MainMenu.aBottomSmallElement.classList.remove('wrongsize');
        }
    }

    static refreshContent() {
        return;
        if (!MainMenu.aBottomLargeElement.classList.contains('wrongsize')) {
            if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                window.CrazyGames.SDK.banner.requestBanner({
                    id: 'squeakyrafts-io_728x90',
                    width: 728,
                    height: 90,
                });
            } else {
                if (window.aiptag && window.aiptag.cmd && window.aiptag.cmd.display) {
                    window.aiptag.cmd.display.push(() => {
                        window.aipDisplayTag.display('squeakyrafts-io_728x90');
                    });
                }
            }
        }

        if (!MainMenu.aBottomSmallElement.classList.contains('wrongsize')) {
            if (IFRAME_ORIGIN && IFRAME_ORIGIN.includes('crazygames')) {
                console.log('requested small');
                window.CrazyGames.SDK.banner.requestBanner({
                    id: 'squeakyrafts-io_320x100',
                    width: 320,
                    height: 100,
                });
            } else {
                if (window.aiptag && window.aiptag.cmd && window.aiptag.cmd.display) {
                    window.aiptag.cmd.display.push(() => {
                        window.aipDisplayTag.display('squeakyrafts-io_320x100');
                    });
                }
            }
        }
    }
}