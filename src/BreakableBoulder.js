class BreakableBoulder {
    static TEXTURE1 = PIXI.Texture.from('assets/boulder1.png');
    static TEXTURE2 = PIXI.Texture.from('assets/boulder2.png');
    static TEXTURE1_CHOPPED = PIXI.Texture.from('assets/boulder1-broken.png');
    static TEXTURE2_CHOPPED = PIXI.Texture.from('assets/boulder2-broken.png');
    static TEXTURE_SHADOW = PIXI.Texture.from('assets/boulder-shadow.png');

    id;
    position;
    sprite;
    shadowSprite;

    damage;

    version;

    // brb, might go take a break 

    constructor(id, position, underwater) {
        this.id = id;
        this.position = position;

        this.version = Math.floor(Math.random() * 2);

        this.sprite = new PIXI.Sprite(BreakableBoulder.getTextures(this.version)[0]);
        if (!underwater) {
            this.sprite.filters = [Environment.surfaceColorShader];
        }
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.85;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
        this.sprite.zIndex = position.y;
        if (underwater) {
            Renderer.underwaterDecor.addChild(this.sprite);
        } else {
            Renderer.abovewaterForeground.addChild(this.sprite);
        }
        this.shadowSprite = new PIXI.Sprite(BreakableBoulder.TEXTURE_SHADOW);
        this.shadowSprite.filters = [Environment.surfaceColorShader];
        this.shadowSprite.anchor.x = 0.5;
        this.shadowSprite.anchor.y = 0.5;
        this.shadowSprite.position.x = position.x;
        this.shadowSprite.position.y = position.y;
        if (underwater) {
            Renderer.underwaterBackground.addChild(this.shadowSprite);
        } else {
            Renderer.abovewaterShadows.addChild(this.shadowSprite);
        }

        CullOptimizer.addPermanentSpriteAfterSetup(this.sprite);
        CullOptimizer.addPermanentSpriteAfterSetup(this.shadowSprite);

        this.damage = 0;
    }

    spawnRocks(player) {
        const rockAmount = Math.floor(Math.random() * 3) + 2;

        // drop rocks
        for (let i = 0; i < rockAmount; i++) {
            const rock = RockManager.addRock(this.id, this.position);
            Packets.writeSpawnRockPacket(this.id, rock.id, player.id, rock.angle, rock.speed, rock.heightSpeed);
        }
    }

    break() {
        this.sprite.texture = BreakableBoulder.getTextures(this.version)[1];
        this.damage = 6;
    }

    hit(player) {
        this.damage += 1;

        if (this.damage === 5) {
            this.break();
            this.spawnRocks(player);
        }
    }

    static getTextures(version) {
        if (version === 0) {
            return [BreakableBoulder.TEXTURE1, BreakableBoulder.TEXTURE1_CHOPPED];
        } else {
            return [BreakableBoulder.TEXTURE2, BreakableBoulder.TEXTURE2_CHOPPED];
        }
    }
}