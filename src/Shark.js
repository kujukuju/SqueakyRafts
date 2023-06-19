class Shark {
    static W = 70;
    static H = 30;
    static SILHOUETTE_TEXTURE = PIXI.Texture.from('assets/shark-shadow.png');
    static SHARK_FIN_TEXTURE = PIXI.Texture.from('assets/shark-fin.png');
    static SHARK_FIN_TEXTURES = [
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(0, 0, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W, 0, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 2, 0, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 3, 0, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 4, 0, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(0,Shark.H, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W,Shark.H, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 2,Shark.H, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 3,Shark.H, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 4,Shark.H, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(0, Shark.H * 2, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W, Shark.H * 2, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 2, Shark.H * 2, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 3, Shark.H * 2, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 4, Shark.H * 2, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(0, Shark.H * 3, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W, Shark.H * 3, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 2, Shark.H * 3, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 3, Shark.H * 3, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 4, Shark.H * 3, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(0, Shark.H * 4, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W, Shark.H * 4, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 2, Shark.H * 4, Shark.W, Shark.H)),
        new PIXI.Texture(Shark.SHARK_FIN_TEXTURE, new PIXI.Rectangle(Shark.W * 3, Shark.H * 4, Shark.W, Shark.H)),
    ];

    id;
    position;

    silhouette;
    container;
    sprites;

    beginRaftIdleTime;
    raftIdleID;
    beginPlayerTargetTime;
    playerTargetID;
    beginRaftTargetTime;
    raftTargetID;

    shotTime;
    desiredShotDirection;
    
    lastBitPlayerTime;
    lastBitRaftTime;

    direction;
    speed;

    // there are 5 sharks
    static attackTargetDelay = 2000;
    static attackTargetInterval = 8000;
    static attackPlayerInterval = 4000;
    static retreatDuration = 25000;
    // static attackTargetDelay = 2000;
    // static attackTargetInterval = 20000;
    // static attackPlayerInterval = 8000;
    // static retreatDuration = 5000;

    constructor(id, position) {
        this.id = id;
        this.position = Vec2.copy(position);

        this.silhouette = new PIXI.Sprite(Shark.SILHOUETTE_TEXTURE);
        this.silhouette.anchor.x = 0.3;
        this.silhouette.anchor.y = 0.5;
        this.silhouette.position.x = position.x;
        this.silhouette.position.y = position.y;
        Renderer.underwaterShark.addChild(this.silhouette);

        this.container = new PIXI.Container();
        this.sprites = [];
        for (let i = 0; i < Shark.SHARK_FIN_TEXTURES.length; i++) {
            const sprite = new PIXI.Sprite(Shark.SHARK_FIN_TEXTURES[i]);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.position.y = -i;
            this.container.addChild(sprite);
            this.sprites.push(sprite);
        }

        this.container.position.x = position.x;
        this.container.position.y = position.y;
        this.container.zIndex = position.y;
        Renderer.abovewaterRaft.addChild(this.container);

        this.beginRaftIdleTime = 0;
        this.raftIdleID = 0;
        this.beginPlayerTargetTime = 0;
        this.playerTargetID = 0;
        this.beginRaftTargetTime = 0;
        this.raftTargetID = 0;

        this.shotTime = 0;
        this.desiredShotDirection = new Vec2();

        this.lastBitPlayerTime = 0;
        this.lastBitRaftTime = 0;

        this.direction = new Vec2();
        this.speed = 0;
    }

    update() {
        if (Information.moon) {
            let raftIdle = null;
            if (this.raftIdleID) {
                raftIdle = RaftManager.getRaft(this.raftIdleID);
                if (!raftIdle) {
                    this.raftIdleID = 0;
                }
            }

            let playerTarget = null;
            if (this.playerTargetID) {
                playerTarget = EntityInformation.getEntity(this.playerTargetID);
                if (!playerTarget) {
                    this.playerTargetID = 0;
                }
            }

            let raftTarget = null;
            if (this.raftTargetID) {
                raftTarget = RaftManager.getRaft(this.raftTargetID);
                if (!raftTarget) {
                    this.raftTargetID = 0;
                }
            }

            if (Loop.time - this.shotTime <= Shark.retreatDuration) {
                if (Loop.time - this.shotTime < 200) {
                    this.adjustSpeedWithDirection(0.5, 6, new Vec2(0, 0));
                } else {
                    this.adjustSpeedWithDirection(0.05, 3, new Vec2(0, 0));
                }

                this.updateMoveDirection(Vec2.copy(this.desiredShotDirection).mul(100).add(this.position));

                this.lastBitPlayerTime = Loop.time;
                this.lastBitRaftTime = Loop.time;
            } else {
                if (raftIdle) {
                    this.adjustSpeedWithDirection(0.05, 3, raftIdle.velocity);

                    // dont teleport if literally on screen
                    if (this.wantsToTeleport(raftIdle.getWorldCenterOfMass()) && !Camera.aabb.contains(this.position.x, this.position.y)) {
                        const teleportPoint = this.getTeleportPoint(raftIdle.getWorldCenterOfMass());
                        if (teleportPoint) {
                            this.position.copy(teleportPoint);
                            if (this.speed === 0) {
                                this.speed = 3;
                            }
                        }
                    }

                    this.updateMoveDirection(raftIdle.getWorldCenterOfMass());

                    let attackingPlayer = false;
                    if (Loop.time - this.lastBitPlayerTime >= Shark.attackPlayerInterval) {
                        const potentialPlayer = this.getNearbyPlayerTarget();
                        if (potentialPlayer) {
                            attackingPlayer = true;
                            this.raftIdleID = 0;
                            this.playerTargetID = potentialPlayer.id;
                            this.beginPlayerTargetTime = Loop.time;
                        }
                    }

                    if (!attackingPlayer) {
                        if (!this.isValidRaftAttackPosition(raftIdle.getWorldCenterOfMass())) {
                            this.raftIdleID = RaftManager.getRandomRaftID();
                            if (this.raftIdleID) {
                                this.beginRaftIdleTime = Loop.time;
                            }
                        } else {
                            if (this.lastBitRaftTime === 0) {
                                this.lastBitRaftTime = Loop.time + Math.floor(Math.random() * 20000);
                            }
                            // the raft is in a valid spot to bite
                            if (Loop.time - this.lastBitRaftTime >= Shark.attackTargetInterval) {
                                this.raftTargetID = this.raftIdleID;
                                this.beginRaftTargetTime = Loop.time;
                                this.raftIdleID = 0;
                            }
                        }
                    }
                } else if (playerTarget) {
                    const targetPosition = playerTarget.getPosition();
                    this.updatePlayerAttackMoveDirection(targetPosition);

                    if (this.wantsToTeleport(targetPosition) && !Camera.aabb.contains(this.position.x, this.position.y)) {
                        const teleportPoint = this.movePointOffScreen(targetPosition);
                        if (teleportPoint) {
                            this.position.copy(teleportPoint);
                            if (this.speed === 0) {
                                this.speed = 3;
                            }
                        }
                    }

                    if (this.isValidPosition(targetPosition)) {
                        if (Loop.time - this.beginPlayerTargetTime < Shark.attackTargetDelay) {
                            // slow down and face the target
                            this.adjustSpeedWithDirection(-0.05, 6, playerTarget.getVelocity());
                        } else if (Loop.time - this.beginPlayerTargetTime > 20000) {
                            // something is clearly wrong
                            console.warn('had to abruptly stop the shark player attack');
                            this.playerTargetID = 0;
                        } else {
                            this.adjustSpeedWithDirection(0.5, 6, playerTarget.getVelocity());

                            if (this.position.distance(targetPosition) < 50) {
                                Packets.writeBitPacket(playerTarget.id);
                                playerTarget.bit();

                                this.playerTargetID = 0;
                                this.lastBitPlayerTime = Loop.time;
                            }
                        }
                    } else {
                        this.playerTargetID = 0;
                    }
                } else if (raftTarget) {
                    // this is super fucked, this method must not work
                    const targetPart = this.getRaftValidTarget(raftTarget);
                    if (!targetPart) {
                        this.raftTargetID = 0;
                    } else {
                        const targetPosition = raftTarget.getPositionFromOffsets(targetPart.offsetX, targetPart.offsetY);
                        this.updateRaftAttackMoveDirection(targetPosition);

                        if (Loop.time - this.beginRaftTargetTime < Shark.attackTargetDelay) {
                            // slow down and face the target
                            this.adjustSpeedWithDirection(-0.1, 6, raftTarget.velocity);
                        } else if (Loop.time - this.beginRaftTargetTime > 20000) {
                            // something is clearly wrong
                            console.warn('had to abruptly stop the shark raft attack');
                            this.raftTargetID = 0;
                        } else {
                            this.adjustSpeedWithDirection(0.5, 6, raftTarget.velocity);

                            if (this.position.distance(targetPosition) < 50) {
                                raftTarget.removePart(targetPart.offsetX, targetPart.offsetY, true);
                                
                                this.raftTargetID = 0;
                                this.lastBitRaftTime = Loop.time;
                            }
                        }
                    }
                } else {
                    // check if there are any players in the water in valid shark attack positions
                    if (Math.random() < 0.5) {
                        this.raftIdleID = RaftManager.getRandomRaftID();
                        if (this.raftIdleID) {
                            this.beginRaftIdleTime = Loop.time;
                        }
                    } else if (Loop.time - this.lastBitPlayerTime >= Shark.attackPlayerInterval) {
                        const player = this.getPlayerFarFromIslandsAndRaftsInWater();
                        if (player) {
                            this.playerTargetID = player.id;
                            this.beginPlayerTargetTime = Loop.time;
                        } else {
                            this.raftIdleID = RaftManager.getRandomRaftID();
                            if (this.raftIdleID) {
                                this.beginRaftIdleTime = Loop.time;
                            } else {
                                const otherPlayer = this.getPlayerInWater();
                                if (otherPlayer) {
                                    this.playerTargetID = otherPlayer.id;
                                    this.beginPlayerTargetTime = Loop.time;
                                }
                            }
                        }
                    }
                }
            }
        }

        this.position.add(Vec2.copy(this.direction).mul(this.speed));
        this.setPosition(this.position);
        this.setRotation(this.direction.atan2());
    }

    sendPackets() {
        Packets.writeSharkPositionVelocityPacket(this.id, this.position.x, this.position.y, this.direction.x * this.speed, this.direction.y * this.speed);
    }

    adjustSpeedWithDirection(accel, maxSpeed, targetVelocity) {
        // adjust the speed to increased the max speed based on the target speed
        
        const kindaTargetSpeedInDirection = Math.max(this.direction.dot(targetVelocity), 0);
        const adjustedMaxSpeed = maxSpeed + kindaTargetSpeedInDirection;

        this.speed = Math.max(Math.min(this.speed + accel, adjustedMaxSpeed), 0);
    }

    updatePlayerAttackMoveDirection(targetPoint) {
        const allowedDeltaAngle = Math.PI / 32;
        const desiredAngle = Vec2.copy(targetPoint).sub(this.position).atan2();

        const bestNewDirection = new Vec2();
        let bestValidStrength = 0;
        const newDirection = new Vec2();
        for (let angleOffset = 0; angleOffset < Math.PI; angleOffset += Math.PI / 16) {
            for (let negate = -1; negate <= 1; negate += 2) {
                const newDesiredAngle = desiredAngle + angleOffset * negate;

                newDirection.x = Math.cos(newDesiredAngle);
                newDirection.y = Math.sin(newDesiredAngle);
                const realNewPosition = Vec2.copy(this.position);
                realNewPosition.x += newDirection.x * 100;
                realNewPosition.y += newDirection.y * 100;

                const validStrength = this.getValidPlayerAttackPositionStrength(realNewPosition);
                if (validStrength > bestValidStrength) {
                    bestValidStrength = validStrength
                    bestNewDirection.copy(newDirection);
                }
            }
        }

        if (bestValidStrength > 0) {
            const currentAngle = this.direction.atan2();
            const newDesiredAngle = bestNewDirection.atan2();
            const angleBetween = MathHelper.radiansBetween(currentAngle, newDesiredAngle);
            
            let newAngle = currentAngle;
            if (Math.abs(angleBetween) <= allowedDeltaAngle) {
                newAngle = newDesiredAngle;
            } else {
                newAngle = currentAngle + Math.sign(angleBetween) * allowedDeltaAngle;
            }

            this.direction.set(Math.cos(newAngle), Math.sin(newAngle));
        }
    }

    updateRaftAttackMoveDirection(targetPoint) {
        const allowedDeltaAngle = Math.PI / 32;
        const desiredAngle = Vec2.copy(targetPoint).sub(this.position).atan2();

        const bestNewDirection = new Vec2();
        let bestValidStrength = 0;
        const newDirection = new Vec2();
        for (let angleOffset = 0; angleOffset < Math.PI; angleOffset += Math.PI / 16) {
            for (let negate = -1; negate <= 1; negate += 2) {
                const newDesiredAngle = desiredAngle + angleOffset * negate;

                newDirection.x = Math.cos(newDesiredAngle);
                newDirection.y = Math.sin(newDesiredAngle);
                const realNewPosition = Vec2.copy(this.position);
                realNewPosition.x += newDirection.x * 100;
                realNewPosition.y += newDirection.y * 100;

                const validStrength = this.getValidRaftAttackPositionStrength(realNewPosition);
                if (validStrength > bestValidStrength) {
                    bestValidStrength = validStrength
                    bestNewDirection.copy(newDirection);
                }
            }
        }

        if (bestValidStrength > 0) {
            const currentAngle = this.direction.atan2();
            const newDesiredAngle = bestNewDirection.atan2();
            const angleBetween = MathHelper.radiansBetween(currentAngle, newDesiredAngle);
            
            let newAngle = currentAngle;
            if (Math.abs(angleBetween) <= allowedDeltaAngle) {
                newAngle = newDesiredAngle;
            } else {
                newAngle = currentAngle + Math.sign(angleBetween) * allowedDeltaAngle;
            }

            this.direction.set(Math.cos(newAngle), Math.sin(newAngle));
        }
    }

    updateMoveDirection(targetPoint) {
        const desiredAngle = Vec2.copy(targetPoint).sub(this.position).atan2();

        const currentValidStrength = this.getValidPositionStrength(Vec2.copy(this.direction).mul(100).add(this.position));
        const angleMul = (1 - currentValidStrength) * 0.75 + 0.25;
        const allowedDeltaAngle = Math.PI / 32 * angleMul;

        const bestNewDirection = new Vec2();
        let bestValidStrength = 0;
        const newDirection = new Vec2();
        for (let angleOffset = 0; angleOffset < Math.PI; angleOffset += Math.PI / 16) {
            for (let negate = -1; negate <= 1; negate += 2) {
                const newDesiredAngle = desiredAngle + angleOffset * negate;

                newDirection.x = Math.cos(newDesiredAngle);
                newDirection.y = Math.sin(newDesiredAngle);
                const realNewPosition = Vec2.copy(this.position);
                realNewPosition.x += newDirection.x * 100;
                realNewPosition.y += newDirection.y * 100;

                const validStrength = this.getValidPositionStrength(realNewPosition);
                if (validStrength > bestValidStrength) {
                    bestValidStrength = validStrength
                    bestNewDirection.copy(newDirection);
                }
            }
        }

        if (bestValidStrength > 0) {
            const currentAngle = this.direction.atan2();
            const newDesiredAngle = bestNewDirection.atan2();
            const angleBetween = MathHelper.radiansBetween(currentAngle, newDesiredAngle);

            let newAngle = currentAngle;
            if (Math.abs(angleBetween) <= allowedDeltaAngle) {
                newAngle = newDesiredAngle;
            } else {
                newAngle = currentAngle + Math.sign(angleBetween) * allowedDeltaAngle;
            }

            this.direction.set(Math.cos(newAngle), Math.sin(newAngle));
        } else {
            console.log('could not find a new valid direction');
        }
    }

    getPlayerInWater() {
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            if (!entity.visuallySwimming) {
                continue;
            }
            if (entity.downed) {
                continue;
            }

            // clear already targeted
            let continueEntity = false;
            for (let i = 0; i < SharkManager.sharks.length; i++) {
                if (SharkManager.sharks[i].playerTargetID === entity.id) {
                    continueEntity = true;
                    break;
                }
            }
            if (continueEntity) {
                continue;
            }

            return entity;
        }
    }

    getPlayerFarFromIslandsAndRaftsInWater() {
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            if (!entity.visuallySwimming) {
                continue;
            }
            if (entity.downed) {
                continue;
            }

            // clear already targeted
            let continueEntity = false;
            for (let i = 0; i < SharkManager.sharks.length; i++) {
                if (SharkManager.sharks[i].playerTargetID === entity.id) {
                    continueEntity = true;
                    break;
                }
            }
            if (continueEntity) {
                continue;
            }

            const position = entity.getPosition();
            const strength = this.getValidPositionStrength(position);

            if (strength < 0.99) {
                continue;
            }

            return entity;
        }
    }

    getNearbyPlayerTarget() {
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            if (!entity.visuallySwimming) {
                continue;
            }
            if (entity.downed) {
                continue;
            }

            // clear already targeted
            let continueEntity = false;
            for (let i = 0; i < SharkManager.sharks.length; i++) {
                if (SharkManager.sharks[i].playerTargetID === entity.id) {
                    continueEntity = true;
                    break;
                }
            }
            if (continueEntity) {
                continue;
            }

            const position = entity.getPosition();
            if (position.distance(this.position) < 1000) {
                if (this.isValidPosition(position)) {
                    return entity;
                }
            }
        }

        return null;
    }

    getRaftValidTarget(raft) {
        let bestDistance = Number.MAX_SAFE_INTEGER;
        let bestPart = null;

        for (let i = 0; i < raft.parts.length; i++) {
            const part = raft.parts[i];
            const partPosition = raft.getPositionFromOffsets(part.offsetX, part.offsetY);

            if (this.isValidRaftAttackPosition(partPosition)) {
                const distance = this.position.distance(partPosition);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestPart = part;
                }
            }
        }

        return bestPart;
    }

    wantsToTeleport(targetPoint) {
        if (Math.random() > 0.02) {
            return false;
        }

        return this.position.distance(targetPoint) > 1500;
    }

    shot(position) {
        this.shotTime = Loop.time;
        this.desiredShotDirection.copy(this.position).sub(position).normalize();

        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity.getPosition().distance(this.position) < 700) {
            const hitSound = AudioInformation.shark_hit.create();
            // hitSound.setPannerPosition(this.position.x * AudioInformation.SCALE, this.position.y * AudioInformation.SCALE, 0);
            AudioInformation.playAudio(hitSound);
        }
    }

    movePointOffScreen(desiredPoint) {
        let containingAABB = null;
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const position = entityList[i].getPosition();

            let inside = true;
            inside = inside && desiredPoint.x >= position.x - 1920 / 6;
            inside = inside && desiredPoint.x < position.x + 1920 / 6;
            inside = inside && desiredPoint.y >= position.y - 1920 / 6;
            inside = inside && desiredPoint.y < position.y + 1920 / 6;

            if (inside) {
                containingAABB = new AABB(position.x, position.y, 1920 / 3, 1920 / 3);
                break;
            }
        }

        if (!containingAABB) {
            return desiredPoint;
        }
        
        const fixed = new Vec2(containingAABB.x - 100, desiredPoint.y);
        if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
            return fixed;
        }

        fixed.x = containingAABB.x + containingAABB.width + 100;
        fixed.y = desiredPoint.y;
        if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
            return fixed;
        }

        fixed.x = desiredPoint.x;
        fixed.y = containingAABB.y - 100;
        if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
            return fixed;
        }

        fixed.x = desiredPoint.x;
        fixed.y = containingAABB.y + containingAABB.height + 100;
        if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
            return fixed;
        }

        return null;
    }

    getTeleportPoint(desiredPoint) {
        const strength = Math.random() * 800 + 400;
        if (RaftManager.isOnRaft(desiredPoint) || this.isIslandArea(desiredPoint)) {
            const fixed = new Vec2(desiredPoint.x - strength, desiredPoint.y);
            if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
                return this.movePointOffScreen(fixed);
            }

            fixed.x = desiredPoint.x + strength;
            fixed.y = desiredPoint.y;
            if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
                return this.movePointOffScreen(fixed);
            }

            fixed.x = desiredPoint.x;
            fixed.y = desiredPoint.y - strength;
            if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
                return this.movePointOffScreen(fixed);
            }

            fixed.x = desiredPoint.x;
            fixed.y = desiredPoint.y + strength;
            if (!RaftManager.isOnRaft(fixed) && !this.isIslandArea(fixed)) {
                return this.movePointOffScreen(fixed);
            }
        }

        return null;
    }

    isIslandArea(desiredPoint) {
        if (!IslandManager.isSwimming(desiredPoint)) {
            return true;
        }

        if (IslandManager.isNearIslandAtAll(desiredPoint)) {
            return true;
        }

        return false;
    }

    isValidRaftAttackPosition(position) {
        return !this.isIslandArea(position);
    }

    isValidPosition(position) {
        return !RaftManager.isOnRaft(position) && !this.isIslandArea(position);
    }

    getValidPlayerAttackPositionStrength(position) {
        if (RaftManager.isOnRaft(position)) {
            return 0;
        }

        return 1 - IslandManager.getNearIslandAtAllStrength(position);
    }

    getValidRaftAttackPositionStrength(position) {
        return 1 - IslandManager.getNearIslandAtAllStrength(position);
    }

    getValidPositionStrength(position) {
        if (RaftManager.isOnRaft(position)) {
            return 0;
        }

        const raftValidStrength = 1 - RaftManager.getNearRaftStrength(position);
        const islandValidStrength = 1 - IslandManager.getNearIslandAtAllStrength(position);

        return Math.min(raftValidStrength, islandValidStrength);
    }

    isOnAnyScreen() {
        let isOnAnyScreen = false;
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            const position = entity.getPosition();

            const padding = 100;
            const minX = position.x - 1920 / 3 / 2 - padding;
            const minY = position.y - 1080 / 3 / 2 - padding;
            const maxX = position.x + 1920 / 3 / 2 + padding;
            const maxY = position.y + 1080 / 3 / 2 + padding;

            let isOnScreen = true;
            isOnScreen = isOnScreen && position.x >= minX;
            isOnScreen = isOnScreen && position.y >= minY;
            isOnScreen = isOnScreen && position.x <= maxX;
            isOnScreen = isOnScreen && position.y <= maxY;
            isOnAnyScreen = isOnAnyScreen || isOnScreen;

            if (isOnAnyScreen) {
                break;
            }
        }

        return isOnAnyScreen;
    }

    setPosition(position) {
        this.position.copy(position);
        this.silhouette.position.x = position.x;
        this.silhouette.position.y = position.y;
        this.container.position.x = position.x;
        this.container.position.y = position.y;
        this.container.zIndex = position.y;
    }

    getRotation() {
        return this.silhouette.rotation;
    }

    setRotation(rotation) {
        this.silhouette.rotation = rotation + Math.PI;
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].rotation = rotation + Math.PI;
        }
    }

    destroy() {
        this.silhouette.destroy();
        this.container.destroy({children: true});
    }
}