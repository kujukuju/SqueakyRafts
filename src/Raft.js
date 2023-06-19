class Raft {
    static VPADDING = 6;

    id;
    parts;
    paddles;
    harpoons;

    position;
    velocity;
    rotation;
    rotationalVelocity;

    aabb;

    waveTick;
    waveOffset;

    localCenterOfMass;
    instantVelocity;

    mass;

    interactTime;

    constructor(startPosition) {
        this.id = Math.floor(Math.random() * 2147483647) + 1;
        this.parts = [];
        this.paddles = [];
        this.harpoons = [];

        this.position = new Vec2(startPosition.x, startPosition.y);
        this.velocity = new Vec2();
        this.rotation = 0;
        this.rotationalVelocity = 0;

        this.aabb = new AABB();

        this.waveTick = 0;
        this.waveOffset = 0;

        this.localCenterOfMass = new Vec2();
        this.instantVelocity = new Vec2();

        this.mass = 0;

        this.interactTime = Loop.time;

        this.addPart(0, 0, true);
    }

    // this shits gonna be hard to sync with box2d

    update() {
        this.instantVelocity.set(0, 0);

        if (Information.moon) {
            const speed = this.velocity.length();
            const drag = speed * speed * 0.01 + 0.005;
            const newSpeed = Math.max(speed - drag, 0);
            this.velocity.normalize().mul(newSpeed);

            const rotDrag = this.rotationalVelocity * this.rotationalVelocity * 1.0 + 0.000003;
            if (Math.abs(rotDrag) > Math.abs(this.rotationalVelocity)) {
                this.rotationalVelocity = 0;
            } else {
                this.rotationalVelocity = this.rotationalVelocity - rotDrag * Math.sign(this.rotationalVelocity);
            }
        }

        // calculate the rotations this thing needs to do right here
        this.rotateAroundCenterOfMass(this.rotationalVelocity);

        // rotations must be done before this point
        this.position.add(this.velocity).add(this.instantVelocity);

        this.waveTick += 1;
        this.waveOffset = Math.sin(this.waveTick / 20) * 2 + Math.sin(this.waveTick / 54.3) * 2;

        for (let i = 0; i < this.parts.length; i++) {
            this.parts[i].update(this.position, this.rotation, this.waveOffset);
        }
        for (let i = 0; i < this.paddles.length; i++) {
            this.paddles[i].update(this.position, this.rotation, this.waveOffset);
        }
        for (let i = 0; i < this.harpoons.length; i++) {
            this.harpoons[i].update(this.position, this.rotation, this.waveOffset);
        }
    }

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        this.position.copy(position);
    }

    getVelocity() {
        return this.velocity;
    }

    setVelocity(velocity) {
        this.velocity.copy(velocity);
    }

    getRotation() {
        return this.rotation;
    }

    // setRotation(rotation) {
    //     this.rotation = rotation;
    // }

    getRotationalVelocity() {
        return this.rotationalVelocity;
    }

    setRotationalVelocity(rotationalVelocity) {
        this.rotationalVelocity = rotationalVelocity;
    }

    getPartAtOffset(offsetX, offsetY) {
        for (let i = 0; i < this.parts.length; i++) {
            if (this.parts[i].offsetX === offsetX && this.parts[i].offsetY === offsetY) {
                return this.parts[i];
            }
        }

        return null;
    }

    getPaddleAtOffset(offsetX, offsetY) {
        for (let i = 0; i < this.paddles.length; i++) {
            if (this.paddles[i].offsetX === offsetX && this.paddles[i].offsetY === offsetY) {
                return this.paddles[i];
            }
        }

        return null;
    }

    getHarpoonAtOffset(offsetX, offsetY) {
        for (let i = 0; i < this.harpoons.length; i++) {
            if (this.harpoons[i].offsetX === offsetX && this.harpoons[i].offsetY === offsetY) {
                return this.harpoons[i];
            }
        }

        return null;
    }

    addPart(offsetX, offsetY, sendPackets) {
        if (offsetX < -128 || offsetX > 128 || offsetY < -128 || offsetY > 128) {
            return;
        }

        const existingPart = this.getPartAtOffset(offsetX, offsetY);
        if (existingPart) {
            return;
        }

        this.parts.push(new RaftPart(this.position, this.rotation, offsetX, offsetY));

        this.calculateAABB();
        this.updateLocalCenterOfMass();
        this.updateMass();

        // remove any now invalid paddles
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x === 0 && y === 0) {
                    continue;
                }

                const newOffsetX = offsetX + x;
                const newOffsetY = offsetY + y;
                const paddle = this.getPaddleAtOffset(newOffsetX, newOffsetY);
                if (paddle) {
                    const facingOffset = paddle.getFacingOffsets();
                    if (facingOffset.x === offsetX && facingOffset.y === offsetY) {
                        this.removePaddle(newOffsetX, newOffsetY);
                    }
                }
            }
        }

        if (sendPackets) {
            Packets.writeBuildRaftPartPacket(this.id, offsetX, offsetY);

        }
    }

    addPaddle(offsetX, offsetY, sendPackets, localDirection) {
        if (offsetX < -128 || offsetX > 128 || offsetY < -128 || offsetY > 128) {
            return;
        }

        const existingPart = this.getPartAtOffset(offsetX, offsetY);
        if (!existingPart) {
            return;
        }

        const existingPaddle = this.getPaddleAtOffset(offsetX, offsetY);
        if (existingPaddle) {
            return;
        }

        const existingHarpoon = this.getHarpoonAtOffset(offsetX, offsetY);
        if (existingHarpoon) {
            return;
        }

        if (this.getPartAtOffset(offsetX + localDirection.x, offsetY + localDirection.y)) {
            return;
        }

        this.paddles.push(new PaddlePart(this.position, this.rotation, offsetX, offsetY, localDirection));

        if (sendPackets) {
            Packets.writeBuildRaftPaddlePacket(this.id, offsetX, offsetY, localDirection);
        }
    }

    addHarpoon(offsetX, offsetY, sendPackets, localDirection) {
        if (offsetX < -128 || offsetX > 128 || offsetY < -128 || offsetY > 128) {
            return;
        }

        const existingPart = this.getPartAtOffset(offsetX, offsetY);
        if (!existingPart) {
            return;
        }

        const existingPaddle = this.getPaddleAtOffset(offsetX, offsetY);
        if (existingPaddle) {
            return;
        }

        const existingHarpoon = this.getHarpoonAtOffset(offsetX, offsetY);
        if (existingHarpoon) {
            return existingHarpoon;
        }

        const part = new HarpoonPart(this.position, this.rotation, offsetX, offsetY, localDirection);
        this.harpoons.push(part);

        if (sendPackets) {
            Packets.writeBuildRaftHarpoonPacket(this.id, offsetX, offsetY, localDirection);
        }
        
        return part;
    }

    destroyRaft(sendPackets) {
        for (let i = 0; i < this.parts.length; i++) {
            this.parts[i].destroy();
        }
        for (let i = 0; i < this.paddles.length; i++) {
            this.paddles[i].destroy();
        }
        for (let i = 0; i < this.harpoons.length; i++) {
            this.harpoons[i].destroy();
        }

        this.parts.length = 0;
        this.paddles.length = 0;
        this.harpoons.length = 0;

        this.destroy();

        if (sendPackets) {
            Packets.writeDestroyRaftPacket(this.id);
        }
    }

    removePart(offsetX, offsetY, sendPackets) {
        for (let i = 0; i < this.parts.length; i++) {
            if (this.parts[i].offsetX === offsetX && this.parts[i].offsetY === offsetY) {
                this.parts[i].destroy();
                this.parts.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.paddles.length; i++) {
            if (this.paddles[i].offsetX === offsetX && this.paddles[i].offsetY === offsetY) {
                this.paddles[i].destroy();
                this.paddles.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.harpoons.length; i++) {
            if (this.harpoons[i].offsetX === offsetX && this.harpoons[i].offsetY === offsetY) {
                this.harpoons[i].destroy();
                this.harpoons.splice(i, 1);
                break;
            }
        }

        const breakAudio = AudioInformation.raft_break.create();
        const position = this.getPositionFromOffsets(offsetX, offsetY);
        breakAudio.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);
        AudioInformation.playAudio(breakAudio);

        this.calculateAABB();
        this.updateLocalCenterOfMass();
        this.updateMass();

        if (this.parts.length === 0) {
            this.destroy();
        }

        if (sendPackets) {
            Packets.writeDestroyRaftPartPacket(this.id, offsetX, offsetY);
        }
    }

    removePaddle(offsetX, offsetY) {
        for (let i = 0; i < this.paddles.length; i++) {
            if (this.paddles[i].offsetX === offsetX && this.paddles[i].offsetY === offsetY) {
                this.paddles[i].destroy();
                this.paddles.splice(i, 1);
                break;
            }
        }
    }

    getNearbyPartOffsets(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const offsetX = Math.round(rotatedDX / 32);
        const offsetY = Math.round(rotatedDY / 32);

        if (this.getPartAtOffset(offsetX, offsetY)) {
            return new Vec2(offsetX, offsetY);
        }

        return null;
    }

    getNearbyAvailableOffsets(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const offsetX = Math.round(rotatedDX / 32);
        const offsetY = Math.round(rotatedDY / 32);

        if (this.getPartAtOffset(offsetX, offsetY)) {
            return null;
        }

        let valid = false;
        valid = valid || this.getPartAtOffset(offsetX - 1, offsetY);
        valid = valid || this.getPartAtOffset(offsetX + 1, offsetY);
        valid = valid || this.getPartAtOffset(offsetX, offsetY - 1);
        valid = valid || this.getPartAtOffset(offsetX, offsetY + 1);
        if (!valid) {
            return null;
        }

        return new Vec2(offsetX, offsetY);
    }

    getNearbyOccupiedOffsets(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const offsetX = Math.round(rotatedDX / 32);
        const offsetY = Math.round(rotatedDY / 32);

        if (this.getPaddleAtOffset(offsetX, offsetY)) {
            return new Vec2(offsetX, offsetY);
        }
        if (this.getHarpoonAtOffset(offsetX, offsetY)) {
            return new Vec2(offsetX, offsetY);
        }

        return null;
    }

    getNearbyOccupiedButEmptyOffsets(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const offsetX = Math.round(rotatedDX / 32);
        const offsetY = Math.round(rotatedDY / 32);

        if (this.getPartAtOffset(offsetX, offsetY) && !this.getPaddleAtOffset(offsetX, offsetY) && !this.getHarpoonAtOffset(offsetX, offsetY)) {
            return new Vec2(offsetX, offsetY);
        }

        return null;
    }

    getOffsetsFromPosition(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        const offsetX = Math.round(rotatedDX / 32);
        const offsetY = Math.round(rotatedDY / 32);
        return new Vec2(offsetX, offsetY);
    }

    getPositionFromOffsets(offsetX, offsetY) {
        const dx = offsetX * 32;
        const dy = offsetY * 32;

        return Vec2.from(dx, dy).rotate(this.rotation).add(this.position);
    }

    calculateAABB() {
        this.aabb.x = 0;
        this.aabb.y = 0;
        this.aabb.width = 0;
        this.aabb.height = 0;
        if (this.parts.length > 0) {
            this.aabb.x = this.parts[0].offsetX * 32;
            this.aabb.y = this.parts[0].offsetY * 32;
        }

        let maxX = this.aabb.x;
        let maxY = this.aabb.y;

        for (let i = 0; i < this.parts.length; i++) {
            const x = this.parts[i].offsetX * 32;
            const y = this.parts[i].offsetY * 32;
            this.aabb.x = Math.min(this.aabb.x, x - 16 - Raft.VPADDING);
            this.aabb.y = Math.min(this.aabb.y, y - 16 - Raft.VPADDING);
            maxX = Math.max(maxX, x + 16 + Raft.VPADDING);
            maxY = Math.max(maxY, y + 16 + Raft.VPADDING);
        }

        this.aabb.width = maxX - this.aabb.x;
        this.aabb.height = maxY - this.aabb.y;
    }

    isOnRaft(position) {
        if (!this.parts.length) {
            return false;
        }

        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const radians = this.rotation;
    
        const rotatedDX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
        const rotatedDY = dy * Math.cos(-radians) + dx * Math.sin(-radians);

        if (this.aabb.contains(rotatedDX, rotatedDY)) {
            for (let i = 0; i < this.parts.length; i++) {
                if (this.parts[i].isOnPart(position)) {
                    return true;
                }
            }
        }

        return false;
    }

    getLinearVelocity(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return new Vec2(this.velocity.x, this.velocity.y);
        }

        // I dont understand why its wrong
        const percCirc = this.rotationalVelocity / (Math.PI * 2);
        const circ = Math.PI * 2 * distance;
        const linearX = -dy / distance * percCirc * circ;
        const linearY = dx / distance * percCirc * circ;

        // no idea if this is right

        return new Vec2(this.velocity.x + this.instantVelocity.x + linearX, this.velocity.y + this.instantVelocity.y + linearY);
    }

    writeRaftCreatePackets() {
        const offsets = [];
        for (let i = 0; i < this.parts.length; i++) {
            offsets.push(this.parts[i].offsetX);
            offsets.push(this.parts[i].offsetY);
        }

        const paddleOffsets = [];
        for (let i = 0; i < this.paddles.length; i++) {
            paddleOffsets.push(this.paddles[i].offsetX);
            paddleOffsets.push(this.paddles[i].offsetY);
            paddleOffsets.push(this.paddles[i].localDirection.x);
            paddleOffsets.push(this.paddles[i].localDirection.y);
        }

        const harpoonOffsets = [];
        for (let i = 0; i < this.harpoons.length; i++) {
            harpoonOffsets.push(this.harpoons[i].offsetX);
            harpoonOffsets.push(this.harpoons[i].offsetY);
            harpoonOffsets.push(this.harpoons[i].localDirection.x);
            harpoonOffsets.push(this.harpoons[i].localDirection.y);
            harpoonOffsets.push(this.harpoons[i].ammoSprites.length);
        }

        Packets.writeAddRaftPartsPacket(this.id, this.position, offsets, paddleOffsets, harpoonOffsets);
    }

    writeSyncPacket() {
        Packets.writeSyncRaftPacket(this.id, this.position, this.velocity, this.rotation, this.rotationalVelocity);
    }

    moveAwayFromIslands() {
        const rotatedAABB = new AABB();
        const p1 = new Vec2(this.aabb.x, this.aabb.y);
        const p2 = new Vec2(this.aabb.x, this.aabb.y + this.aabb.height);
        const p3 = new Vec2(this.aabb.x + this.aabb.width, this.aabb.y + this.aabb.height);
        const p4 = new Vec2(this.aabb.x + this.aabb.width, this.aabb.y);
        p1.rotate(this.rotation).add(this.position);
        p2.rotate(this.rotation).add(this.position);
        p3.rotate(this.rotation).add(this.position);
        p4.rotate(this.rotation).add(this.position);

        const minX = Math.min(p1.x, Math.min(p2.x, Math.min(p3.x, p4.x)));
        const minY = Math.min(p1.y, Math.min(p2.y, Math.min(p3.y, p4.y)));
        const maxX = Math.max(p1.x, Math.max(p2.x, Math.max(p3.x, p4.x)));
        const maxY = Math.max(p1.y, Math.max(p2.y, Math.max(p3.y, p4.y)));

        rotatedAABB.x = minX;
        rotatedAABB.y = minY;
        rotatedAABB.width = maxX - minX;
        rotatedAABB.height = maxY - minY;

        const potentialOverlapPolygons = IslandManager.overlapsIsland(rotatedAABB);
        if (potentialOverlapPolygons) {
            for (let a = 0; a < potentialOverlapPolygons.length; a++) {
                const potentialPolygon = potentialOverlapPolygons[a];
                for (let i = 0; i < this.parts.length; i++) {
                    const position = this.getPositionFromOffsets(this.parts[i].offsetX, this.parts[i].offsetY);

                    if (MathHelper.isPointInPolygon(potentialPolygon, position)) {
                        const normal = MathHelper.getNearestNormal(potentialPolygon, position);

                        this.applyForceAtPoint(position, normal.mul(0.002));
                    }
                }
            }
        }
    }

    destroy() {
        RaftManager.removeRaft(this.id);
    }

    rotateAroundCenterOfMass(radians) {
        // idk how to do this in local space... so...

        const worldCenterOfMass = this.getWorldCenterOfMass();
        const desiredNewPosition = Vec2.copy(this.position).sub(worldCenterOfMass).rotate(radians);
        desiredNewPosition.add(worldCenterOfMass);

        this.instantVelocity.x += desiredNewPosition.x - this.position.x;
        this.instantVelocity.y += desiredNewPosition.y - this.position.y;

        // const originalCenterDelta = Vec2.from(-this.localCenterOfMass.x, -this.localCenterOfMass.y);
        // const centerDelta = Vec2.from(-this.localCenterOfMass.x, -this.localCenterOfMass.y);
        // centerDelta.rotate(radians);

        // this.instantVelocity.add(centerDelta.sub(originalCenterDelta));

        this.rotation += radians;
    }

    updateLocalCenterOfMass() {
        this.localCenterOfMass.x = 0;
        this.localCenterOfMass.y = 0;
        if (this.parts.length === 0) {
            return;
        }

        for (let i = 0; i < this.parts.length; i++) {
            this.localCenterOfMass.x += this.parts[i].offsetX * 32;
            this.localCenterOfMass.y += this.parts[i].offsetY * 32;
        }

        this.localCenterOfMass.x /= this.parts.length;
        this.localCenterOfMass.y /= this.parts.length;
    }

    updateMass() {
        this.mass = 5.0 + Math.sqrt(this.parts.length) / 2.0;
    }

    getWorldCenterOfMass() {
        return Vec2.copy(this.localCenterOfMass).rotate(this.rotation).add(this.position);
    }

    applyForceAtPoint(point, force) {
        const centerOfMass = this.getWorldCenterOfMass();
        const dx = point.x - centerOfMass.x;
        const dy = point.y - centerOfMass.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.mass === 0) {
            return;
        }

        // const radiansBetween = MathHelper.radiansBetween(Math.atan2(dy, dx), force.atan2());

        // const linearPercent = Math.cos(radiansBetween);
        // this.velocity.x += force.x * linearPercent;
        // this.velocity.y += force.y * linearPercent;

        // what the fuck am I doing
        // const momentOfInertia = this.mass * (distance * 0.5 + 1) * (distance * 0.5 + 1);

        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;

        // I fucking doubt it
        // this is really not right at all
        // GOOD ENOUGH
        const torque = Vec2.from(dx, dy).cross(force) / this.mass;
        // const angularAccel = torque / momentOfInertia
        const angularAccel = torque * (Math.sqrt(distance) * 0.00001) / this.mass;
        this.rotationalVelocity += angularAccel;

        // force += force;
		// m_torque += b2Cross(point - m_sweep.c, force);
    }

    getNearRaftStrength(point) {
        const localPoint = Vec2.copy(point).sub(this.position).rotate(-this.rotation);

        let closestDistance = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < this.parts.length; i++) {
            const partOffset = new Vec2(this.parts[i].offsetX * 32, this.parts[i].offsetY * 32);

            const distanceSquared = localPoint.distanceSquared(partOffset);
            if (distanceSquared < closestDistance) {
                closestDistance = distanceSquared;
            }
        }

        const strengthDistance = 100;
        return 1 - Math.max(Math.min((Math.sqrt(closestDistance) - 16) / strengthDistance, 1), 0);
    }

    static closestDirection(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        if (Math.abs(cos) > Math.abs(sin)) {
            if (cos < 0) {
                return new Vec2(-1, 0);
            } else {
                return new Vec2(1, 0);
            }
        } else {
            if (sin < 0) {
                return new Vec2(0, -1);
            } else {
                return new Vec2(0, 1);
            }
        }
    }
}