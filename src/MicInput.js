class MicInput {
    static firstCallback;

    static REQUIRE_MIC = false;

    static releasedTime = 0;

    static canReceive = false;

    static requested = false;

    static initialize() {
        if (MicInput.requested) {
            return;
        }
        MicInput.requested = true;

        // // oh boy here we go
        const input = new NSWA.MicrophonePitchShiftedInput();
        input.setStride(2);
        if (Information.moon) {
            input.setPitchShift(1.0);
        } else {
            input.setPitchShift(1.4);
        }

        const requireMic = MicInput.REQUIRE_MIC && !Information.moon;

        input.onBytes = (bytes) => {
            if (!bytes) {
                return;
            }

            EntityInformation.writeVoice(bytes.length);

            const now = Date.now();
            if (Input.keys[Input.KEY_T] && MainMenu.voiceChatEnabled) {
                MicInput.releasedTime = now;
            }

            const keyDown = now - MicInput.releasedTime < 500;
            const clientEntity = EntityInformation.getClientEntity();
            if (clientEntity) {
                clientEntity.chatSprite.visible = keyDown;
            }

            if (MicInput.firstCallback) {
                if (requireMic) {
                    if (!keyDown) {
                        return;
                    }

                    for (let i = 0; i < bytes.length; i++) {
                        if (Math.abs(bytes[i]) > 0.01) {
                            MicInput.firstCallback();
                            MicInput.firstCallback = null;
                            break;
                        }
                    }
                } else {
                    MicInput.firstCallback();
                    MicInput.firstCallback = null;
                }
            }

            if (!keyDown) {
                return;
            }

            for (let i = 0; i < bytes.length; i++) {
                if (Number.isNaN(bytes[i]) || !Number.isFinite(bytes[i])) {
                    return;
                }
            }

            if (clientEntity && MainMenu.voiceChatEnabled) {
                clientEntity.sendVoice(bytes);
            }
        };
    }
}