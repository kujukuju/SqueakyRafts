class WinManager {
    static WIN_TEXTURE = PIXI.Texture.from('assets/win-screen.png');
    static WIN_CLOSE_TEXTURE = PIXI.Texture.from('assets/win-screen-close.png');

    static aabb = new AABB();
    static winZone = [];

    static plebDeaths = 0;

    static container;
    static sprite;
    static closeSprite;
    static killedText;
    static savedText;

    static killedTextPosition = new Vec2(1082 - 50, 673 + 15);
    static savedTextPosition = new Vec2(1082 + 23 - 50, 754 + 15);

    static closeSpriteAABB = new AABB(1136, 750, 1332 - 1136, 812 - 750);

    static alreadyWon = false;

    static initialize() {
        this.container = new PIXI.Container();
        this.container.visible = false;
        Renderer.map.addChild(this.container);

        this.sprite = new PIXI.Sprite(WinManager.WIN_TEXTURE);
        this.container.addChild(this.sprite);

        this.closeSprite = new PIXI.Sprite(WinManager.WIN_CLOSE_TEXTURE);
        this.closeSprite.visible = false;
        this.container.addChild(this.closeSprite);

        this.killedText = new PIXI.Text('0', {fontFamily: 'Aloevera', fontSize: 72, fill: 0x000000, align: 'left'});
        this.killedText.anchor.x = 0;
        this.killedText.anchor.y = 1;
        this.container.addChild(this.killedText);

        this.savedText = new PIXI.Text('0', {fontFamily: 'Aloevera', fontSize: 72, fill: 0x000000, align: 'left'});
        this.savedText.anchor.x = 0;
        this.savedText.anchor.y = 1;
        this.container.addChild(this.savedText);

        this.resize();
    }

    static update() {
        // if (!Information.moon) {
        //     return;
        // }

        const entity = EntityInformation.getClientEntity();
        if (entity) {
            const position = entity.getPosition();
            if (this.aabb.contains(position.x, position.y)) {
                if (MathHelper.isPointInPolygon(this.winZone, position)) {
                    this.win(entity);
                }
            }
        }

        if (this.container.visible) {
            const width = this.WIN_TEXTURE.width;
            const height = this.WIN_TEXTURE.height;

            if (!MOBILE) {
                const mouse = Input.mousePosition;
                const percX = mouse.x / window.innerWidth;
                const percY = mouse.y / window.innerHeight;

                const modifiedMouseX = percX * width;
                const modifiedMouseY = percY * height;

                this.closeSprite.visible = false;
                if (this.closeSpriteAABB.contains(modifiedMouseX, modifiedMouseY)) {
                    this.closeSprite.visible = true;
                    if (Input.mouseDownLeft & Input.DELTA_DOWN) {
                        this.container.visible = false;
                    }
                }
            } else {
                for (const touchID in MobileControls.touches) {
                    const touch = MobileControls.touches[touchID];

                    const percX = touch.x / window.innerWidth;
                    const percY = touch.y / window.innerHeight;
    
                    const modifiedMouseX = percX * width;
                    const modifiedMouseY = percY * height;
    
                    this.closeSprite.visible = false;
                    if (this.closeSpriteAABB.contains(modifiedMouseX, modifiedMouseY)) {
                        this.closeSprite.visible = true;
                        this.container.visible = false;
                    }
                }
            }
        }
    }

    static win(entity) {
        if (this.alreadyWon) {
            return;
        }
        this.alreadyWon = true;
        this.container.visible = true;

        const clientPosition = entity.getPosition();

        const deadPlebs = WinManager.plebDeaths;
        let savedPlebs = 0;
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const pleb = entityList[i];
            if (!(pleb instanceof PlebEntity)) {
                continue;
            }

            const position = pleb.getPosition();
            if (clientPosition.distance(position) < 2000) {
                savedPlebs += 1;
            }
        }

        this.killedText.text = String(deadPlebs);
        this.savedText.text = String(savedPlebs);
    }
    
    static setWinZone(polygon) {
        this.aabb.x = polygon[0][0];
        this.aabb.y = polygon[0][1];
        this.aabb.width = 0;
        this.aabb.height = 0;

        let maxX = this.aabb.x;
        let maxY = this.aabb.y;
        for (let i = 0; i < polygon.length; i++) {
            polygon[i] = new Vec2(polygon[i][0], polygon[i][1]);

            this.aabb.x = Math.min(this.aabb.x, polygon[i].x);
            this.aabb.y = Math.min(this.aabb.y, polygon[i].y);
            maxX = Math.max(maxX, polygon[i].x);
            maxY = Math.max(maxY, polygon[i].y);
        }

        this.aabb.width = maxX - this.aabb.x;
        this.aabb.height = maxY - this.aabb.y;

        this.winZone = polygon;
    }

    static resize() {
        this.sprite.width = window.innerWidth;
        this.sprite.height = window.innerHeight;
        this.closeSprite.width = window.innerWidth;
        this.closeSprite.height = window.innerHeight;

        this.killedText.position.x = this.killedTextPosition.x / 1920 * window.innerWidth;
        this.killedText.position.y = this.killedTextPosition.y / 1080 * window.innerHeight;

        this.savedText.position.x = this.savedTextPosition.x / 1920 * window.innerWidth;
        this.savedText.position.y = this.savedTextPosition.y / 1080 * window.innerHeight;
    }
}