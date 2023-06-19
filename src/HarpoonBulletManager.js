class HarpoonBulletManager {
    static bullets = [];

    static update() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
        }
    }

    static addBullet(raftID, start, direction) {
        this.bullets.push(new HarpoonBullet(raftID, start, direction));
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