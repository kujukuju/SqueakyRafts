class InstructionPage {
    static WOOD_INSTRUCTIONS_TEXTURE = PIXI.Texture.from('assets/build-instructions.png');
    static STONE_INSTRUCTIONS_TEXTURE = PIXI.Texture.from('assets/stone-instructions.png');
    static BUILD_RAFT = PIXI.Texture.from('assets/build-raft.png');
    static BUILD_PADDLE = PIXI.Texture.from('assets/build-paddle.png');
    static BUILD_HARPOON = PIXI.Texture.from('assets/build-harpoon.png');

    woodInstructions;
    stoneInstructions;
    buildRaft;
    buildPaddle;
    buildHarpoon;

    static initialize() {
        const windowMin = Math.min(window.innerWidth, window.innerHeight);

        const scale = Math.min(1, windowMin * 0.8 / InstructionPage.WOOD_INSTRUCTIONS_TEXTURE.width);

        this.woodInstructions = new PIXI.Sprite(this.WOOD_INSTRUCTIONS_TEXTURE);
        this.woodInstructions.anchor.x = 0.5;
        this.woodInstructions.anchor.y = 0;
        this.woodInstructions.scale.x = scale;
        this.woodInstructions.scale.y = scale;
        this.woodInstructions.visible = false;
        Renderer.fixed.addChild(this.woodInstructions);
        
        this.stoneInstructions = new PIXI.Sprite(this.STONE_INSTRUCTIONS_TEXTURE);
        this.stoneInstructions.anchor.x = 0.5;
        this.stoneInstructions.anchor.y = 0;
        this.stoneInstructions.scale.x = scale;
        this.stoneInstructions.scale.y = scale;
        this.stoneInstructions.visible = false;
        Renderer.fixed.addChild(this.stoneInstructions);
        
        this.buildRaft = new PIXI.Sprite(this.BUILD_RAFT);
        this.buildRaft.anchor.x = 0.5;
        this.buildRaft.anchor.y = 0;
        this.buildRaft.scale.x = scale;
        this.buildRaft.scale.y = scale;
        this.buildRaft.visible = false;
        Renderer.fixed.addChild(this.buildRaft);
        
        this.buildPaddle = new PIXI.Sprite(this.BUILD_PADDLE);
        this.buildPaddle.anchor.x = 0.5;
        this.buildPaddle.anchor.y = 0;
        this.buildPaddle.scale.x = scale;
        this.buildPaddle.scale.y = scale;
        this.buildPaddle.visible = false;
        Renderer.fixed.addChild(this.buildPaddle);
        
        this.buildHarpoon = new PIXI.Sprite(this.BUILD_HARPOON);
        this.buildHarpoon.anchor.x = 0.5;
        this.buildHarpoon.anchor.y = 0;
        this.buildHarpoon.scale.x = scale;
        this.buildHarpoon.scale.y = scale;
        this.buildHarpoon.visible = false;
        Renderer.fixed.addChild(this.buildHarpoon);

        this.resize();
    }

    static update() {
        const clientEntity = EntityInformation.getClientEntity();
        if (!clientEntity) {
            this.woodInstructions.visible = false;
            this.stoneInstructions.visible = false;
            this.buildRaft.visible = false;
            this.buildPaddle.visible = false;
            this.buildHarpoon.visible = false;

            return;
        }

        this.woodInstructions.visible = clientEntity.carryingWoodID && !clientEntity.ghostedRaft && !clientEntity.ghostedPaddle && !clientEntity.ghostedHarpoon;
        this.stoneInstructions.visible = !!(clientEntity.carryingRockID || clientEntity.carryingDeadPlebID);
        this.buildRaft.visible = !!clientEntity.ghostedRaft;
        this.buildPaddle.visible = !!clientEntity.ghostedPaddle;
        this.buildHarpoon.visible = !!clientEntity.ghostedHarpoon;

        if (MOBILE) {
            let key1 = false;
            let key2 = false;
            let key3 = false;

            if (this.woodInstructions.visible) {
                for (const touchID in MobileControls.touches) {
                    const touch = MobileControls.touches[touchID];

                    let inside1 = true;
                    inside1 = inside1 && touch.x >= this.woodInstructions.position.x - this.woodInstructions.width / 2.0;
                    inside1 = inside1 && touch.x < this.woodInstructions.position.x - this.woodInstructions.width / 2.0 + this.woodInstructions.width / 3.0;
                    inside1 = inside1 && touch.y >= this.woodInstructions.position.y;
                    inside1 = inside1 && touch.y < this.woodInstructions.position.y + this.woodInstructions.height;
                    key1 = key1 || inside1;

                    let inside2 = true;
                    inside2 = inside2 && touch.x >= this.woodInstructions.position.x - this.woodInstructions.width / 2.0 + this.woodInstructions.width / 3.0;
                    inside2 = inside2 && touch.x < this.woodInstructions.position.x - this.woodInstructions.width / 2.0 + 2.0 * this.woodInstructions.width / 3.0;
                    inside2 = inside2 && touch.y >= this.woodInstructions.position.y;
                    inside2 = inside2 && touch.y < this.woodInstructions.position.y + this.woodInstructions.height;
                    key2 = key2 || inside2;

                    let inside3 = true;
                    inside3 = inside3 && touch.x >= this.woodInstructions.position.x - this.woodInstructions.width / 2.0 + 2.0 * this.woodInstructions.width / 3.0;
                    inside3 = inside3 && touch.x < this.woodInstructions.position.x - this.woodInstructions.width / 2.0 + this.woodInstructions.width;
                    inside3 = inside3 && touch.y >= this.woodInstructions.position.y;
                    inside3 = inside3 && touch.y < this.woodInstructions.position.y + this.woodInstructions.height;
                    key3 = key3 || inside3;
                }
            }

            if (this.stoneInstructions.visible) {
                for (const touchID in MobileControls.touches) {
                    const touch = MobileControls.touches[touchID];

                    let inside1 = true;
                    inside1 = inside1 && touch.x >= this.stoneInstructions.position.x - this.stoneInstructions.width / 2.0;
                    inside1 = inside1 && touch.x < this.stoneInstructions.position.x - this.stoneInstructions.width / 2.0 + this.stoneInstructions.width;
                    inside1 = inside1 && touch.y >= this.stoneInstructions.position.y;
                    inside1 = inside1 && touch.y < this.stoneInstructions.position.y + this.stoneInstructions.height;
                    key1 = key1 || inside1;
                }
            }

            if (key1) {
                if (!Input.keys[Input.KEY_1]) {
                    Input.keys[Input.KEY_1] = Input.DOWN | Input.DELTA_DOWN;
                } else {
                    Input.keys[Input.KEY_1] = Input.DOWN;
                }
            } else {
                Input.keys[Input.KEY_1] = Input.NONE;
            }

            if (key2) {
                if (!Input.keys[Input.KEY_2]) {
                    Input.keys[Input.KEY_2] = Input.DOWN | Input.DELTA_DOWN;
                } else {
                    Input.keys[Input.KEY_2] = Input.DOWN;
                }
            } else {
                Input.keys[Input.KEY_2] = Input.NONE;
            }

            if (key3) {
                if (!Input.keys[Input.KEY_3]) {
                    Input.keys[Input.KEY_3] = Input.DOWN | Input.DELTA_DOWN;
                } else {
                    Input.keys[Input.KEY_3] = Input.DOWN;
                }
            } else {
                Input.keys[Input.KEY_3] = Input.NONE;
            }
        }
    }

    static resize() {
        this.woodInstructions.position.x = window.innerWidth / 2;
        this.woodInstructions.position.y = window.innerHeight / 6 * 4;
        this.stoneInstructions.position.x = window.innerWidth / 2;
        this.stoneInstructions.position.y = window.innerHeight / 6 * 4;
        this.buildRaft.position.x = window.innerWidth / 2;
        this.buildRaft.position.y = window.innerHeight / 6 * 4;
        this.buildPaddle.position.x = window.innerWidth / 2;
        this.buildPaddle.position.y = window.innerHeight / 6 * 4;
        this.buildHarpoon.position.x = window.innerWidth / 2;
        this.buildHarpoon.position.y = window.innerHeight / 6 * 4;
    }
}