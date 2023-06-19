class GunBulletManager {
    static bullets = [];

    static update() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
        }
    }

    static addBullet(start, direction) {
        const instance = AudioInformation.gun_shot.create();
        if (!Information.moon) {
            instance.setPannerPosition(start.x * AudioInformation.SCALE, start.y * AudioInformation.SCALE, 0);
        }
        AudioInformation.playAudio(instance);

        this.bullets.push(new GunBullet(start, direction));
    }

    static removeBullet(bullet) {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i] === bullet) {
                this.bullets.splice(i, 1);
                return;
            }
        }
    }
}