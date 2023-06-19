class MobileControls {
    static leftElement;
    static rightElement;

    static touches = {};

    static initialize() {
        if (MOBILE) {
            MobileControls.leftElement = document.getElementById('mobile-left');
            MobileControls.rightElement = document.getElementById('mobile-right');

            MobileControls.leftElement.style.display = 'block';
            MobileControls.rightElement.style.display = 'block';

            window.addEventListener('touchstart', event => {
                if (MainMenu.mainMenuVisible) {
                    return true;
                }

                if (event.target.tagName.toLowerCase() === 'input') {
                    return true;
                }

                if (ChatManager.chatParentElement.contains(event.target)) {
                    ChatManager.focus();
                    return true;
                }

                ChatManager.chatInputElement.blur();
                ChatManager.blur();

                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i];
                    MobileControls.touches[touch.identifier] = new Vec2(touch.clientX, touch.clientY);
                    MobileControls.touches[touch.identifier].new = true;
                }

                event.preventDefault();
                return false;
            }, {passive: false});
            window.addEventListener('touchmove', event => {
                if (MainMenu.mainMenuVisible) {
                    return true;
                }

                if (event.target.tagName.toLowerCase() === 'input') {
                    return true;
                }

                if (ChatManager.chatParentElement.contains(event.target)) {
                    return true;
                }

                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i];
                    const found = MobileControls.touches[touch.identifier];
                    if (found) {
                        found.x = touch.clientX;
                        found.y = touch.clientY;
                    }
                }

                event.preventDefault();
                return false;
            }, {passive: false});
            window.addEventListener('touchend', event => {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i];
                    delete MobileControls.touches[touch.identifier];
                }

                return true;
            }, {passive: false});
            window.addEventListener('touchcancel', event => {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i];
                    delete MobileControls.touches[touch.identifier];
                }

                return true;
            }, {passive: false});
        }
    }

    static update() {
        if (!MOBILE) {
            return;
        }

        const offset = 0.22;
        const boundingLeft = MobileControls.leftElement.getBoundingClientRect();
        const boundingRight = MobileControls.rightElement.getBoundingClientRect();

        const radius = boundingLeft.width * 0.25;
        
        const leftLeftPoint = new Vec2(boundingLeft.x + boundingLeft.width * offset, boundingLeft.y + boundingLeft.height * 0.5);
        const leftRightPoint = new Vec2(boundingLeft.x + boundingLeft.width * (1.0 - offset), boundingLeft.y + boundingLeft.height * 0.5);
        const leftTopPoint = new Vec2(boundingLeft.x + boundingLeft.width * 0.5, boundingLeft.y + boundingLeft.height * offset);
        const leftBottomPoint = new Vec2(boundingLeft.x + boundingLeft.width * 0.5, boundingLeft.y + boundingLeft.height * (1.0 - offset));
        
        const rightLeftPoint = new Vec2(boundingRight.x + boundingRight.width * offset, boundingRight.y + boundingRight.height * 0.5);
        const rightRightPoint = new Vec2(boundingRight.x + boundingRight.width * (1.0 - offset), boundingRight.y + boundingRight.height * 0.5);
        const rightTopPoint = new Vec2(boundingRight.x + boundingRight.width * 0.5, boundingRight.y + boundingRight.height * offset);
        const rightBottomPoint = new Vec2(boundingRight.x + boundingRight.width * 0.5, boundingRight.y + boundingRight.height * (1.0 - offset));

        let leftLeftTouch = false;
        let leftRightTouch = false;
        let leftTopTouch = false;
        let leftBottomTouch = false;

        let rightLeftTouch = false;
        let rightRightTouch = false;
        let rightTopTouch = false;
        let rightBottomTouch = false;

        for (const touchID in MobileControls.touches) {
            const touch = MobileControls.touches[touchID];

            const leftLeftTouching = leftLeftPoint.distance(touch) < radius;
            const leftRightTouching = leftRightPoint.distance(touch) < radius;
            const leftTopTouching = leftTopPoint.distance(touch) < radius;
            const leftBottomTouching = leftBottomPoint.distance(touch) < radius;

            const rightLeftTouching = rightLeftPoint.distance(touch) < radius;
            const rightRightTouching = rightRightPoint.distance(touch) < radius;
            const rightTopTouching = rightTopPoint.distance(touch) < radius;
            const rightBottomTouching = rightBottomPoint.distance(touch) < radius;

            leftLeftTouch = leftLeftTouch || leftLeftTouching;
            leftRightTouch = leftRightTouch || leftRightTouching;
            leftTopTouch = leftTopTouch || leftTopTouching;
            leftBottomTouch = leftBottomTouch || leftBottomTouching;

            rightLeftTouch = rightLeftTouch || rightLeftTouching;
            rightRightTouch = rightRightTouch || rightRightTouching;
            rightTopTouch = rightTopTouch || rightTopTouching;
            rightBottomTouch = rightBottomTouch || rightBottomTouching;

            touch.consumed = false;
            if (leftLeftTouching || leftRightTouching || leftTopTouching || leftBottomTouching || rightLeftTouching || rightRightTouching || rightTopTouching || rightBottomTouching) {
                touch.consumed = true;
            }
        }

        if (leftLeftTouch) {
            if (!Input.keys[Input.KEY_A]) {
                Input.keys[Input.KEY_A] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_A] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_A] = Input.NONE;
        }

        if (leftRightTouch) {
            if (!Input.keys[Input.KEY_D]) {
                Input.keys[Input.KEY_D] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_D] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_D] = Input.NONE;
        }

        if (leftTopTouch) {
            if (!Input.keys[Input.KEY_W]) {
                Input.keys[Input.KEY_W] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_W] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_W] = Input.NONE;
        }

        if (leftBottomTouch) {
            if (!Input.keys[Input.KEY_S]) {
                Input.keys[Input.KEY_S] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_S] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_S] = Input.NONE;
        }

        if (rightLeftTouch) {
            if (!Input.keys[Input.KEY_Q]) {
                Input.keys[Input.KEY_Q] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_Q] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_Q] = Input.NONE;
        }

        if (rightRightTouch) {
            if (!Input.keys[Input.KEY_F]) {
                Input.keys[Input.KEY_F] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_F] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_F] = Input.NONE;
        }

        if (rightTopTouch) {
            if (!Input.keys[Input.KEY_T]) {
                Input.keys[Input.KEY_T] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_T] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_T] = Input.NONE;
        }

        if (rightBottomTouch) {
            if (!Input.keys[Input.KEY_E]) {
                Input.keys[Input.KEY_E] = Input.DOWN | Input.DELTA_DOWN;
            } else {
                Input.keys[Input.KEY_E] = Input.DOWN;
            }
        } else {
            Input.keys[Input.KEY_E] = Input.NONE;
        }
    }

    static clear() {
        for (const touchID in MobileControls.touches) {
            const touch = MobileControls.touches[touchID];
            touch.new = false;
        }
    }

    static hasNewTouch() {
        for (const touchID in MobileControls.touches) {
            const touch = MobileControls.touches[touchID];
            if (touch.new && !touch.consumed) {
                return true;
            }
        }

        return false;
    }
}