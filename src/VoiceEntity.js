class VoiceEntity {
    static CHAT_TEXTURE = PIXI.Texture.from('assets/chat-bubble.png');
    static emptyReceivedVoice = (new Array(1024)).fill(0);

    voice;
    bass;

    underwater;
    visuallySwimming;
    isOnRaft;

    p1;
    p2;
    t1;
    v1;
    v2;
    t2;

    queuedVoiceReceive;
    queuedVoiceReceiveWriteIndex;
    queuedVoiceReceiveReadIndex;
    queuedVoiceReceivePlayIndex;

    queuedVoiceSend;

    actualWriteBytes;

    canReceiveVoice;

    animUp;
    animDown;
    animLeft;
    animRight;

    punching;
    oldPunching;
    canPunch;
    canPunchLocal;

    spriteUnderwater;
    oldSpriteUnderwater;
    headUnderwater;
    oldHeadUnderwater;

    carryingWoodID;
    carryingRockID;

    buildingRaft;
    buildingPaddle;
    buildingHarpoon;
    ghostedRaft;
    ghostedPaddle;
    ghostedHarpoon;

    // loadingHarpoon;
    // ghostedHarpoonAmmo;

    interactingRaftID;
    interactingOffsets;

    holdingPlayerID;
    beingCarried;
    carryReleasedTime;

    carryingDeadPlebID;

    chatSprite;
    lastTalkTime;

    downed;
    downedTime;

    aiming;
    oldAiming;
    aimDirection;

    lastAteTime;

    audio;
    normalFootstepAudio;
    woodFootstepAudio;
    punchingAudio;
    swimAudio;

    dontPlayPunchAudioStartTime;

    constructor() {
        this.voice = new NSWA.ByteOutput();
        this.voice.setPannerOrientation(0, 0, -1);
        this.voice.setStride(2);
        if (this instanceof MoonEntity) {
            this.voice.setVolume(0.8);
        } else {
            this.voice.setVolume(0.9);
        }
        this.voice.play();

        this.bass = new NSWA.BassTrebleNode();
        this.bass.setBassGain(60);
        this.bass.setTrebleGain(-20);
        this.bass.setGain(-40);

        this.swimming = false;
        this.visuallySwimming = false;
        this.isOnRaft = false;

        this.p1 = new Vec2();
        this.p2 = new Vec2();
        this.v1 = new Vec2();
        this.v2 = new Vec2();

        this.queuedVoiceReceive = [];
        this.queuedVoiceReceive.length = 512 * 10;
        this.queuedVoiceReceive.fill(0);
        this.queuedVoiceReceiveWriteIndex = 0;
        this.queuedVoiceReceiveReadIndex = 0;
        this.queuedVoiceReceivePlayIndex = 0;

        this.queuedVoiceSend = [];
        this.canReceiveVoice = false;

        this.actualWriteBytes = [];

        this.animUp = false;
        this.animDown = true;
        this.animLeft = false;
        this.animRight = false;

        this.punching = false;
        this.oldPunching = false;
        this.canPunch = true;
        this.canPunchLocal = true;

        this.spriteUnderwater = false;
        this.oldSpriteUnderwater = false;
        this.headUnderwater = false;
        this.oldHeadUnderwater = false;

        // 0 is no carry
        this.carryingWoodID = 0;
        this.carryingRockID = 0;
        this.carryingDeadPlebID = 0;

        this.holdingPlayerID = 0;
        this.beingCarried = false;
        this.carryReleasedTime = 0;

        this.chatSprite = new PIXI.Sprite(VoiceEntity.CHAT_TEXTURE);
        this.chatSprite.anchor.x = 0.5;
        this.chatSprite.anchor.y = 1;
        this.chatSprite.visible = false;
        Renderer.abovewaterForeground.addChild(this.chatSprite);

        this.lastTalkTime = 0;

        this.downed = false;
        this.downedTime = 0;

        this.aiming = false;
        this.oldAiming = false;
        this.aimDirection = new Vec2();

        this.lastAteTime = 0;

        this.audio = [];
        this.normalFootstepAudio = null;
        this.woodFootstepAudio = null;
        this.underwaterAudio = null;
        this.punchingAudio = null;
        this.swimAudio = null;

        this.dontPlayPunchAudioStartTime = 0;
    }
s
    update() {
        const position = this.getPosition();
        const raft = RaftManager.getOnRaft(position);
        if (raft) {
            const raftVel = raft.getLinearVelocity(position);
            this.groundVelocity.x = raftVel.x;
            this.groundVelocity.y = raftVel.y;
            raft.interactTime = Loop.time;
        } else {
            this.groundVelocity.x = 0;
            this.groundVelocity.y = 0;
        }

        if (EntityInformation.getClientEntity() === this) {
            const accel = new Vec2();
            if (Input.keys[Input.KEY_W]) {
                accel.y -= 1;
            }
            if (Input.keys[Input.KEY_S]) {
                accel.y += 1;
            }
            if (Input.keys[Input.KEY_A]) {
                accel.x -= 1;
            }
            if (Input.keys[Input.KEY_D]) {
                accel.x += 1;
            }
            if (this.downed) {
                accel.set(0, 0);
            }
            const ACCEL = 0.4;

            accel.normalize().mul(ACCEL);
            const relativeVelocity = Vec2.copy(this.getVelocity()).subtract(this.groundVelocity);
            let speed = relativeVelocity.length();

            if (Loop.time - this.carryReleasedTime > 400) {
                const FRICTION = 0.2;
                if (speed > 0 && speed - FRICTION <= 0) {
                    speed = 0;
                } else if (speed > 0) {
                    speed -= FRICTION;
                }
            }

            relativeVelocity.normalize().mul(speed);
            const newRelativeVelocity = Vec2.copy(relativeVelocity).add(accel);
            const newSpeed = newRelativeVelocity.length();

            let maxSpeed = (this instanceof MoonEntity) ? 3.0 : 2.5;
            if (this.aiming) maxSpeed = 0;
            else if (this.visuallySwimming && this.carryingWoodID) maxSpeed = 0.5 + 0.5;
            else if (this.visuallySwimming && this.carryingRockID) maxSpeed = 0.5 + 0.5;
            else if (this.visuallySwimming && this.carryingDeadPlebID) maxSpeed = 0.5 + 0.5;
            else if (this.visuallySwimming && this.holdingPlayerID) maxSpeed = 0.5 + 0.5;
            else if (this.carryingWoodID) maxSpeed = 1.5 + 0.5;
            else if (this.carryingRockID) maxSpeed = 1.5 + 0.5;
            else if (this.carryingDeadPlebID) maxSpeed = 1.5 + 0.5;
            else if (this.holdingPlayerID) maxSpeed = 1.5 + 0.5;
            else if (this.swimming && this.punching) maxSpeed = 0.5 + 0.5;
            else if (this.punching) maxSpeed = 0.75 + 0.5;
            else if (this.swimming) maxSpeed = 1.5 + 0.5;
            if (Loop.time - this.lastAteTime < 30000) {
                maxSpeed *= 1.5;
            }
            if (Loop.time - this.carryReleasedTime > 400) {
                if (newSpeed > maxSpeed) {
                    newRelativeVelocity.normalize().mul(maxSpeed);
                }
            }

            newRelativeVelocity.add(this.groundVelocity);
            this.setVelocity(newRelativeVelocity);
            this.setPosition(Vec2.copy(position).add(this.getVelocity()));

            this.punching = Input.keys[Input.KEY_E] && !this.interactingRaftID;

            if (this.punching) {
                this.canPunch = this.canPunch || Math.floor(this.sprite.getFrame()) !== 3;
                const punched = this.canPunch && Math.floor(this.sprite.getFrame()) === 3;

                if (punched) {
                    this.canPunch = false;

                    const punchingPoint = this.getFrontPoint();
                    const potentialTree = TreeManager.getNearbyTree(punchingPoint) || TreeManager.getNearbyTree(this.getPosition());
                    if (potentialTree) {
                        potentialTree.hit(this);
                    } else {
                        const potentialBoulder = BoulderManager.getNearbyBoulder(punchingPoint) || BoulderManager.getNearbyBoulder(this.getPosition());
                        if (potentialBoulder) {
                            potentialBoulder.hit(this);
                        }
                    }
                }
            }

            if (this.carryingWoodID) {
                const wood = WoodManager.getWood(this.carryingWoodID);
                if (wood && wood.playerID !== this.id) {
                    this.carryingWoodID = 0;
                }
            }
            if (this.carryingRockID) {
                const rock = RockManager.getRock(this.carryingRockID);
                if (rock && rock.playerID !== this.id) {
                    this.carryingRockID = 0;
                }
            }
            if (this.carryingDeadPlebID) {
                const pleb = PlebDeathManager.getDeadPleb(this.carryingDeadPlebID);
                if (pleb && pleb.playerID !== this.id) {
                    this.carryingDeadPlebID = 0;
                }
            }

            if (this.holdingPlayerID) {
                if (!EntityInformation.getEntity(this.holdingPlayerID)) {
                    this.holdingPlayerID = 0;
                }
            }

            if (Input.keys[Input.KEY_F] & Input.DELTA_DOWN) {
                if (this.carryingRockID) {
                    const rock = RockManager.getRock(this.carryingRockID);

                    if (rock) {
                        rock.release(true);
                    }
                } else if (this.carryingWoodID) {
                    const wood = WoodManager.getWood(this.carryingWoodID);

                    if (wood) {
                        wood.release(true);
                    }
                } else if (this.carryingDeadPlebID) {
                    const pleb = PlebDeathManager.getDeadPleb(this.carryingDeadPlebID);

                    if (pleb) {
                        pleb.release(true);
                    }
                } else if (this.holdingPlayerID) {

                } else {
                    const pickupPoint = this.getFrontPoint();

                    let wood =  WoodManager.getNearbyUncarriedWood(pickupPoint);
                    if (!wood) {
                        wood = WoodManager.getNearbyUncarriedWood(this.getPosition());
                    }
                    if (wood) {
                        wood.setCarry(this, true);
                    } else {
                        let rock =  RockManager.getNearbyUncarriedRock(pickupPoint);
                        if (!rock) {
                            rock = RockManager.getNearbyUncarriedRock(this.getPosition());
                        }
                        if (rock) {
                            rock.setCarry(this, true);
                        } else {
                            let pleb =  PlebDeathManager.getNearbyUncarriedPleb(pickupPoint);
                            if (!pleb) {
                                pleb = PlebDeathManager.getNearbyUncarriedPleb(this.getPosition());
                            }
                            if (pleb) {
                                pleb.setCarry(this, true);
                            }
                        }
                    }
                }
            }

            if (this.carryingWoodID) {
                if (Input.keys[Input.KEY_1]) {
                    this.buildingRaft = true;
                    this.buildingPaddle = false;
                    this.buildingHarpoon = false;
                } else if (Input.keys[Input.KEY_2]) {
                    this.buildingRaft = false;
                    this.buildingPaddle = true;
                    this.buildingHarpoon = false;
                } else if (Input.keys[Input.KEY_3]) {
                    this.buildingRaft = false;
                    this.buildingPaddle = false;
                    this.buildingHarpoon = true;
                } else if (Input.keys[Input._KEY_4]) {
                    this.buildingRaft = false;
                    this.buildingPaddle = false;
                    this.buildingHarpoon = false;
                }
            } else {
                this.buildingRaft = false;
                this.buildingPaddle = false;
                this.buildingHarpoon = false;
            }
            // this.loadingHarpoon = !!this.carryingStoneID;
            // if (this.carryingStoneID) {
            //     if (Input.keys[Input.KEY_1]) {
            //         this.loadingHarpoon = true;
            //     } else if (Input.keys[Input.KEY_2]) {
            //         this.loadingHarpoon = false;
            //     }
            // } else {
            //     this.loadingHarpoon = false;
            // }

            if (this.buildingRaft && !this.ghostedRaft) {
                this.ghostedRaft = new GhostedRaftPart(this.getFrontPoint(), 0);
            } else if (!this.buildingRaft && this.ghostedRaft) {
                this.ghostedRaft.destroy();
                this.ghostedRaft = null;
            }

            if (this.buildingPaddle && !this.ghostedPaddle) {
                const direction = new Vec2();
                if (this.animLeft) direction.x = -1;
                if (this.animRight) direction.x = 1;
                if (this.animUp) direction.y = -1;
                if (this.animDown) direction.y = 1;
                this.ghostedPaddle = new GhostedPaddlePart(this.getFrontPoint(), direction);
            } else if (!this.buildingPaddle && this.ghostedPaddle) {
                this.ghostedPaddle.destroy();
                this.ghostedPaddle = null;
            }

            if (this.buildingHarpoon && !this.ghostedHarpoon) {
                this.ghostedHarpoon = new GhostedHarpoonPart(this.getFrontPoint(), 0);
            } else if (!this.buildingHarpoon && this.ghostedHarpoon) {
                this.ghostedHarpoon.destroy();
                this.ghostedHarpoon = null;
            }

            // if (this.loadingHarpoon && !this.ghostedHarpoonAmmo) {
            //     this.ghostedHarpoonAmmo = new GhostedRaftPart(this.getFrontPoint(), 0);
            // } else if (!this.loadingHarpoon && this.ghostedHarpoonAmmo) {
            //     this.ghostedHarpoonAmmo.destroy();
            //     this.ghostedHarpoonAmmo = null;
            // }

            if (this.ghostedRaft) {
                this.ghostedRaft.update(this.getFrontPoint(), 0);
            }

            if (this.ghostedPaddle) {
                const direction = new Vec2();
                if (this.animLeft) direction.x = -1;
                if (this.animRight) direction.x = 1;
                if (this.animUp) direction.y = -1;
                if (this.animDown) direction.y = 1;
                this.ghostedPaddle.update(this.getFrontPoint(0.5), direction);
            }

            if (this.ghostedHarpoon) {
                const direction = new Vec2();
                if (this.animLeft) direction.x = -1;
                if (this.animRight) direction.x = 1;
                if (this.animUp) direction.y = -1;
                if (this.animDown) direction.y = 1;
                this.ghostedHarpoon.update(this.getFrontPoint(0.5), direction);
            }

            let loadedRock = false;
            if (this.carryingRockID && (Input.keys[Input.KEY_E] & Input.DELTA_DOWN)) {
                const rock = RockManager.getRock(this.carryingRockID);
                if (rock) {
                    const interactable = RaftManager.getNearbyOccupiedOffsets(this.getPosition());
                    if (interactable) {
                        const raft = interactable[0];
                        const offsetX = interactable[1].x;
                        const offsetY = interactable[1].y;
                        const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                        if (harpoon) {
                            this.dontPlayPunchAudioStartTime = Loop.time;
                            loadedRock = true;
                            harpoon.loadRock(raft, this.id, true);
                            rock.consume(true);
                            this.carryingRockID = 0;
                        }
                    }
                }
            } else if (this.carryingDeadPlebID && (Input.keys[Input.KEY_E] & Input.DELTA_DOWN)) {
                const pleb = PlebDeathManager.getDeadPleb(this.carryingDeadPlebID);
                if (pleb) {
                    const interactable = RaftManager.getNearbyOccupiedOffsets(this.getPosition());
                    if (interactable) {
                        const raft = interactable[0];
                        const offsetX = interactable[1].x;
                        const offsetY = interactable[1].y;
                        const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                        if (harpoon) {
                            this.dontPlayPunchAudioStartTime = Loop.time;
                            loadedRock = true;
                            harpoon.loadRock(raft, this.id, true);
                            pleb.consume(true);
                            this.carryingDeadPlebID = 0;
                        }
                    }
                }
            }

            // if (this.ghostedHarpoonAmmo) {
            //     this.ghostedHarpoonAmmo.update(this.getFrontPoint(0.75), 0);
            // }

            if (!this.interactingRaftID && (Input.keys[Input.KEY_E] & Input.DELTA_DOWN) && !this.carryingWoodID && !this.carryingRockID && !this.carryingDeadPlebID && !this.holdingPlayerID && !loadedRock) {
                const interactable = RaftManager.getNearbyOccupiedOffsets(this.getPosition());
                if (interactable) {
                    const raft = interactable[0];
                    const offsetX = interactable[1].x;
                    const offsetY = interactable[1].y;
                    if (!this.doesInteractionAlreadyExist(raft, offsetX, offsetY)) {
                        this.setInteraction(raft.id, offsetX, offsetY, true);
                    }
                } else {
                    const deadUneatenPleb = PlebDeathManager.getNearbyUneatenPleb(this.getPosition());
                    if (deadUneatenPleb) {
                        deadUneatenPleb.eat(true);
                        this.lastAteTime = Loop.time;
                    }
                }
            } else if (this.interactingRaftID) {
                let stopKey = false;
                if (this.isInteractingWithHarpoon()) {
                    stopKey = !!(Input.keys[Input.KEY_E] & Input.DELTA_DOWN);
                } else {
                    stopKey = !Input.keys[Input.KEY_E];
                }
                let shouldStopInteracting = false;
                if (stopKey) {
                    shouldStopInteracting = true;
                } else {
                    const raft = RaftManager.getRaft(this.interactingRaftID);
                    if (raft) {
                        if (!raft.getPaddleAtOffset(this.interactingOffsets.x, this.interactingOffsets.y) && !raft.getHarpoonAtOffset(this.interactingOffsets.x, this.interactingOffsets.y)) {
                            shouldStopInteracting = true;
                        } else if (raft.getPositionFromOffsets(this.interactingOffsets.x, this.interactingOffsets.y).distance(this.getPosition()) > 60) {
                            shouldStopInteracting = true;
                        }
                    }
                }

                if (shouldStopInteracting) {
                    this.clearInteraction(true);
                }
            }

            if (this.interactingRaftID) {
                if (this.doesLowerIDHaveSameInteraction()) {
                    this.clearInteraction(true);
                }
            }

            if (this.isInteractingWithHarpoon()) {
                const raft = RaftManager.getRaft(this.interactingRaftID);
                if (raft) {
                    const harpoonPosition = raft.getPositionFromOffsets(this.interactingOffsets.x, this.interactingOffsets.y);
                    this.setPosition(harpoonPosition);

                    const aimPosition = Camera.getMousePosition();

                    const harpoon = raft.getHarpoonAtOffset(this.interactingOffsets.x, this.interactingOffsets.y);
                    const worldDirection = Vec2.copy(aimPosition).sub(harpoonPosition).normalize();
                    harpoon.setWorldDirection(worldDirection, raft.rotation);

                    Packets.writeHarpoonDirectionPacket(raft.id, this.interactingOffsets.x, this.interactingOffsets.y, harpoon.localDirection.x, harpoon.localDirection.y);

                    if (Input.mouseDownLeft & Input.DELTA_DOWN || MobileControls.hasNewTouch()) {
                        harpoon.fire(raft, worldDirection, true);
                    }
                }

                Camera.setScaleImmediate(new Vec2(2, 2));
            } else {
                Camera.setScaleImmediate(new Vec2(3, 3));
            }

            this.sendPackets();
        } else {
            if (Loop.time - this.lastTalkTime < 500) {
                this.chatSprite.visible = true;
            } else {
                this.chatSprite.visible = false;
            }
        }

        // update positions if this isnt you
        const clientEntity = EntityInformation.getClientEntity();
        const audioPosition = this.getPosition();
        for (let i = 0; i < this.audio.length; i++) {
            if (clientEntity !== this) {
                this.audio[i].setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }

            if (isAudioFinished(this.audio[i])) {
                this.audio[i].stop();
                this.audio.splice(i, 1);
                i--;
            }
        }

        if (this.woodFootstepAudio) {
            if (clientEntity !== this) {
                this.woodFootstepAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }
        }

        if (this.normalFootstepAudio) {
            if (clientEntity !== this) {
                this.normalFootstepAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }
        }

        if (this.punchingAudio && clientEntity !== this) {
            this.punchingAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
        }

        const playPunchAudio = this.punching && (Loop.time - this.dontPlayPunchAudioStartTime > 250);
        if (playPunchAudio && !this.punchingAudio) {
            this.punchingAudio = AudioInformation.swing.create();
            this.punchingAudio.setLoop(true);
            if (clientEntity !== this) {
                this.punchingAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }
            this.punchingAudio.play();
        } else if (!playPunchAudio && this.punchingAudio) {
            this.punchingAudio.stop();
            this.punchingAudio = null;
        }

        if (this.punching) {
            this.canPunchLocal = this.canPunchLocal || Math.floor(this.sprite.getFrame()) !== 2;
            const punched = this.canPunchLocal && Math.floor(this.sprite.getFrame()) === 2;

            if (punched) {
                this.canPunchLocal = false;

                const punchingPoint = this.getFrontPoint();
                const potentialTree = TreeManager.getNearbyTree(punchingPoint) || TreeManager.getNearbyTree(this.getPosition());
                if (potentialTree) {
                    this.playAudio(AudioInformation.chop_tree.create());
                } else {
                    const potentialBoulder = BoulderManager.getNearbyBoulder(punchingPoint) || BoulderManager.getNearbyBoulder(this.getPosition());
                    if (potentialBoulder) {
                        this.playAudio(AudioInformation.hit_rock.create());
                    }
                }
            }
        }

        if (this.swimAudio) {
            if (clientEntity !== this) {
                this.swimAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }
            const volume = Math.min(this.getVelocity().length() / 2.0 * 0.2, 0.2);
            this.swimAudio.setVolume(volume);
        }

        const shouldPlaySwimAudio = this.visuallySwimming && this.getVelocity().length() > 0.9;
        if (shouldPlaySwimAudio && !this.swimAudio) {
            this.swimAudio = AudioInformation.swim.create();
            this.swimAudio.setVolume(0);
            if (clientEntity !== this) {
                this.swimAudio.setPannerPosition(audioPosition.x * AudioInformation.SCALE, audioPosition.y * AudioInformation.SCALE, 0);
            }
            this.swimAudio.play();
            this.swimAudio.seek(this.swimAudio._source.getDuration() * Math.random());
            this.swimAudio.setLoop(true);
        } else if (!shouldPlaySwimAudio && this.swimAudio) {
            this.swimAudio.stop();
            this.swimAudio = null;
        }

        this.updateAnimation();
    }

    isInteractingWithHarpoon() {
        if (!this.interactingRaftID) {
            return false;
        }
        const raft = RaftManager.getRaft(this.interactingRaftID);
        if (!raft) {
            return false;
        }

        const harpoon = raft.getHarpoonAtOffset(this.interactingOffsets.x, this.interactingOffsets.y);
        if (!harpoon) {
            return false;
        }

        return true;
    }

    setInteraction(raftID, offsetX, offsetY, broadcast) {
        this.interactingRaftID = raftID;
        this.interactingOffsets = new Vec2(offsetX, offsetY);

        this.dontPlayPunchAudioStartTime = Loop.time;

        const raft = RaftManager.getRaft(raftID);
        if (raft) {
            const paddle = raft.getPaddleAtOffset(offsetX, offsetY);
            if (paddle) {
                paddle.setPaddling(true);
            } else {
                const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                if (harpoon) {
                    if (this instanceof MoonEntity) {
                        harpoon.moonControlled = true;
                        harpoon.plebControlled = false;
                    } else {
                        harpoon.moonControlled = false;
                        harpoon.plebControlled = true;
                    }
                }
            }
        }

        if (broadcast) {
            Packets.writeInteractionPacket(this.id, raftID, offsetX, offsetY);
        }
    }

    clearInteraction(broadcast) {
        if (!this.interactingRaftID) {
            return;
        }

        this.dontPlayPunchAudioStartTime = Loop.time;

        let cancelInteraction = true;
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];
            if (entity === this) {
                continue;
            }

            if (!entity.interactingRaftID) {
                continue;
            }

            let sameInteraction = true;
            sameInteraction = sameInteraction && entity.interactingRaftID === this.interactingRaftID;
            sameInteraction = sameInteraction && entity.interactingOffsets.x === this.interactingOffsets.x;
            sameInteraction = sameInteraction && entity.interactingOffsets.y === this.interactingOffsets.y;

            if (sameInteraction) {
                cancelInteraction = false;
                break;
            }
        }

        const raft = RaftManager.getRaft(this.interactingRaftID);
        if (raft && cancelInteraction) {
            const paddle = raft.getPaddleAtOffset(this.interactingOffsets.x, this.interactingOffsets.y);
            if (paddle) {
                paddle.setPaddling(false);
            } else {
                const harpoon = raft.getHarpoonAtOffset(this.interactingOffsets.x, this.interactingOffsets.y);
                if (harpoon) {
                    harpoon.moonControlled = false;
                    harpoon.plebControlled = false;
                }
            }
        }

        if (broadcast) {
            Packets.writeClearInteractionPacket(this.id, this.interactingRaftID, this.interactingOffsets.x, this.interactingOffsets.y);
        }

        this.interactingRaftID = 0;
        this.interactingOffsets = null;
    }

    sendPackets() {
        const position = this.getPosition();
        const velocity = this.getVelocity();
        Packets.writePositionVelocityPacket(this.id, position, velocity);

        if (this.queuedVoiceSend.length > 0) {
            Packets.writeVoicePacket(this.id, this.queuedVoiceSend);
            this.queuedVoiceSend.length = 0;
        }

        if (this.punching !== this.oldPunching) {
            this.oldPunching = this.punching;
            Packets.writePunchingPacket(this.id, this.punching);
        }
    }

    playFootstepAudio(wood) {
        if (wood) {
            if (this.normalFootstepAudio) {
                this.normalFootstepAudio.stop();
                this.normalFootstepAudio = null;
            }

            if (!this.woodFootstepAudio) {
                const position = this.getPosition();
                this.woodFootstepAudio = AudioInformation.walk_wood.create();
                this.woodFootstepAudio.setLoop(true);
                if (EntityInformation.getClientEntity() !== this) {
                    this.woodFootstepAudio.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);
                }
                this.woodFootstepAudio.play();
            }
        } else {
            if (this.woodFootstepAudio) {
                this.woodFootstepAudio.stop();
                this.woodFootstepAudio = null;
            }

            if (!this.normalFootstepAudio) {
                const position = this.getPosition();
                this.normalFootstepAudio = AudioInformation.walk.create();
                this.normalFootstepAudio.setLoop(true);
                if (EntityInformation.getClientEntity() !== this) {
                    this.normalFootstepAudio.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);
                }
                this.normalFootstepAudio.play();
            }
        }
    }

    stopFoostepAudio() {
        if (this.normalFootstepAudio) {
            this.normalFootstepAudio.stop();
            this.normalFootstepAudio = null;
        }

        if (this.woodFootstepAudio) {
            this.woodFootstepAudio.stop();
            this.woodFootstepAudio = null;
        }
    }

    render() {
        let position;
        if (EntityInformation.getClientEntity() === this) {
            position = this.getPosition();
        } else {
            position = this.getInterpolatedPosition();
        }

        this.voice.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);

        const raft = RaftManager.getOnRaft(position);
        this.isOnRaft = !!raft;
        this.swimming = IslandManager.isSwimming(position) && !this.isOnRaft;
        this.visuallySwimming = this.swimming && !IslandManager.isNearIsland(position) && !this.isOnRaft;

        let waveOffset = 0;
        if (raft) {
            waveOffset = raft.waveOffset;
        }

        if (EntityInformation.getClientEntity() === this) {
            NSWA.setListenerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 10);
        }

        this.spriteUnderwater = this.visuallySwimming;
        this.headUnderwater = (this.visuallySwimming && this.punching) || (this.visuallySwimming && this.carryingWoodID) || (this.visuallySwimming && this.carryingRockID) || (this.visuallySwimming && this.carryingDeadPlebID) || (this.visuallySwimming && this.holdingPlayerID);

        if (this.swimming) {
            this.shadowSprite.visible = false;
        } else {
            this.shadowSprite.visible = true;
            cullSprite(this.shadowSprite);
        }

        if (this.spriteUnderwater && !this.oldSpriteUnderwater) {
            this.oldSpriteUnderwater = this.spriteUnderwater;

            this.sprite.parent.removeChild(this.sprite);
            Renderer.underwaterForeground.addChild(this.sprite);
        } else if (!this.spriteUnderwater && this.oldSpriteUnderwater) {
            this.oldSpriteUnderwater = this.spriteUnderwater;

            this.sprite.parent.removeChild(this.sprite);
            Renderer.abovewaterForeground.addChild(this.sprite);
        }

        if (this.headUnderwater && !this.oldHeadUnderwater) {
            this.oldHeadUnderwater = this.headUnderwater;

            this.sprite.parent.removeChild(this.headSprite);
            Renderer.underwaterForeground.addChild(this.headSprite);
            
            this.voice.addExtraNode(this.bass);
        } else if (!this.headUnderwater && this.oldHeadUnderwater) {
            this.oldHeadUnderwater = this.headUnderwater;

            this.sprite.parent.removeChild(this.headSprite);
            Renderer.abovewaterForeground.addChild(this.headSprite);

            this.voice.removeExtraNode(this.bass);
        }

        if (EntityInformation.getClientEntity() === this) {
            let underwaterAlpha = Environment.surfaceColorShader.getColor()[3];
            if (this.headUnderwater) {
                underwaterAlpha = Math.min(underwaterAlpha + 0.1, 1);
            } else {
                underwaterAlpha = Math.max(underwaterAlpha - 0.1, 0);
            }

            Environment.surfaceColorShader.getColor()[3] = underwaterAlpha;

            Environment.interactableColorShader.getColor()[3] = underwaterAlpha;

            const r = Environment.defaultBackgroundColor[0] + (Environment.defaultUnderwaterColor[0] - Environment.defaultBackgroundColor[0]) * underwaterAlpha;
            const g = Environment.defaultBackgroundColor[1] + (Environment.defaultUnderwaterColor[1] - Environment.defaultBackgroundColor[1]) * underwaterAlpha;
            const b = Environment.defaultBackgroundColor[2] + (Environment.defaultUnderwaterColor[2] - Environment.defaultBackgroundColor[2]) * underwaterAlpha;
            Environment.waterFilter.setBackgroundColor(r, g, b);

            const strength = Environment.defaultStrength + (0.4 - Environment.defaultStrength) * underwaterAlpha;
            Environment.waterFilter.setStrength(strength);

            const opacity = Environment.defaultOpacity + (0 - Environment.defaultOpacity) * underwaterAlpha;
            Environment.waterFilter.setOpacity(opacity);
        }

        const beingCarriedOffset = (this.beingCarried || Loop.time - this.carryReleasedTime <= 600) ? 40 : 0;
        const swimmingOffset = this.swimming ? this.getHeight() / 2 : 0;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y + swimmingOffset + waveOffset - beingCarriedOffset;
        this.sprite.zIndex = position.y;
        this.headSprite.position.x = position.x;
        this.headSprite.position.y = position.y + swimmingOffset + waveOffset - beingCarriedOffset;
        this.headSprite.zIndex = position.y + 1;
        this.shadowSprite.position.x = position.x;
        this.shadowSprite.position.y = position.y + waveOffset;
        this.chatSprite.position.x = position.x
        this.chatSprite.position.y = position.y + swimmingOffset + waveOffset - beingCarriedOffset - this.getHeight();
        this.chatSprite.zIndex = position.y + 2;

        cullSprite(this.sprite);

        if (this.isInteractingWithHarpoon()) {
            this.sprite.visible = false;
            this.headSprite.visible = false;
            this.shadowSprite.visible = false;
        }
    }

    updateAnimation() {
        const velocity = Vec2.copy(this.getVelocity()).sub(this.groundVelocity);

        const up = Math.abs(velocity.y) >= Math.abs(velocity.x) && velocity.y < -0.1;
        const down = !up && Math.abs(velocity.y) >= Math.abs(velocity.x) && velocity.y > 0.1;
        const left = !up && !down && Math.abs(velocity.x) >= Math.abs(velocity.y) && velocity.x < -0.1;
        const right = !up && !down && !left && Math.abs(velocity.x) >= Math.abs(velocity.y) && velocity.x > 0.1;
        const still = !up && !down && !left && !right;
        if (!still) {
            this.animUp = up;
            this.animDown = down;
            this.animLeft = left;
            this.animRight = right;
        }

        const DEFAULT_SPEED = 1.0 / 10.0;

        this.headSprite.visible = false;

        if (this.downed) {
            this.stopFoostepAudio();
            return false;
        }
        if (this.aiming) {
            this.stopFoostepAudio();
            return false;
        }

        if (this.beingCarried) {
            this.stopFoostepAudio();
            if (this.animUp) this.sprite.gotoAnimation('idle-back', 0);
            if (this.animDown) this.sprite.stepAnimation('idle-front', 0);
            if (this.animLeft) this.sprite.stepAnimation('idle-left', 0);
            if (this.animRight) this.sprite.stepAnimation('idle-right', 0);
            return true;
        } else if (this.carryingWoodID || this.carryingRockID || this.carryingDeadPlebID || this.holdingPlayerID) {
            if (still) {
                this.stopFoostepAudio();
                if (this.animUp) this.sprite.gotoAnimation('holding-back', 0);
                if (this.animDown) this.sprite.gotoAnimation('holding-front', 0);
                if (this.animLeft) this.sprite.gotoAnimation('holding-left', 0);
                if (this.animRight) this.sprite.gotoAnimation('holding-right', 0);
            } else {
                const mul = (this instanceof PlebEntity) ? 2 : 1;
                const speed = velocity.length() / 1.5 / 7.5 * mul;
                if (velocity.length() >= 1.5) {
                    this.playFootstepAudio(this.isOnRaft);
                }
                if (this.animUp) this.sprite.stepAnimation('holding-walk-back', speed || DEFAULT_SPEED, true);
                if (this.animDown) this.sprite.stepAnimation('holding-walk-front', speed || DEFAULT_SPEED, true);
                if (this.animLeft) this.sprite.stepAnimation('holding-walk-left', speed || DEFAULT_SPEED, true);
                if (this.animRight) this.sprite.stepAnimation('holding-walk-right', speed || DEFAULT_SPEED, true);
            }
            return true;
        } else if (this.interactingRaftID) {
            this.stopFoostepAudio();
            if (this.animUp) this.sprite.stepAnimation('paddle-back', DEFAULT_SPEED * 1.5, true);
            if (this.animDown) this.sprite.stepAnimation('paddle-front', DEFAULT_SPEED * 1.5, true);
            if (this.animLeft) this.sprite.stepAnimation('paddle-left', DEFAULT_SPEED * 1.5, true);
            if (this.animRight) this.sprite.stepAnimation('paddle-right', DEFAULT_SPEED * 1.5, true);
            return true;
        } else if (this.punching) {
            this.stopFoostepAudio();
            if (this.animUp) this.sprite.stepAnimation('punch-back', DEFAULT_SPEED * 1.5, true);
            if (this.animDown) this.sprite.stepAnimation('punch-front', DEFAULT_SPEED * 1.5, true);
            if (this.animLeft) this.sprite.stepAnimation('punch-left', DEFAULT_SPEED * 1.5, true);
            if (this.animRight) this.sprite.stepAnimation('punch-right', DEFAULT_SPEED * 1.5, true);
            return true;
        } else if (this.swimming) {
            this.stopFoostepAudio();
            const mul = (this instanceof PlebEntity) ? 2 : 1;
            const speed = velocity.length() / 1.5 / 7.5 * mul;
            if (this.animUp) this.sprite.stepAnimation('swim-back', speed || DEFAULT_SPEED, true);
            if (this.animDown) this.sprite.stepAnimation('swim-front', speed || DEFAULT_SPEED, true);
            if (this.animLeft) this.sprite.stepAnimation('swim-left', speed || DEFAULT_SPEED, true);
            if (this.animRight) this.sprite.stepAnimation('swim-right', speed || DEFAULT_SPEED, true);
            this.headSprite.gotoAnimation(this.sprite.currentName, this.sprite.currentFrame);
            this.headSprite.visible = true;
            cullSprite(this.headSprite);
            return true;
        } else if (still) {
            this.stopFoostepAudio();
            if (this.animUp) this.sprite.gotoAnimation('idle-back', 0);
            if (this.animDown) this.sprite.stepAnimation('idle-front', 0);
            if (this.animLeft) this.sprite.stepAnimation('idle-left', 0);
            if (this.animRight) this.sprite.stepAnimation('idle-right', 0);
            return true;
        } else {
            const mul = (this instanceof PlebEntity) ? 2 : 1;
            const maxSpeed = (this instanceof MoonEntity) ? 3.0 : 2.5;
            const speed = velocity.length() / maxSpeed / 5 * mul;
            if (velocity.length() >= 1.5) {
                this.playFootstepAudio(this.isOnRaft);
            }
            if (this.animUp) this.sprite.stepAnimation('walk-back', speed || DEFAULT_SPEED, true);
            if (this.animDown) this.sprite.stepAnimation('walk-front', speed || DEFAULT_SPEED, true);
            if (this.animLeft) this.sprite.stepAnimation('walk-left', speed || DEFAULT_SPEED, true);
            if (this.animRight) this.sprite.stepAnimation('walk-right', speed || DEFAULT_SPEED, true);
            return true;
        }
    }

    doesInteractionAlreadyExist(raft, offsetX, offsetY) {
        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];

            if (entity.interactingRaftID === raft.id) {
                if (entity.interactingOffsets.x === offsetX && entity.interactingOffsets.y === offsetY) {
                    return true;
                }
            }
        }

        return false;
    }

    doesLowerIDHaveSameInteraction() {
        if (!this.interactingRaftID) {
            return false;
        }

        const entityList = EntityInformation.getEntityList();
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i];

            if (entity.interactingRaftID === this.interactingRaftID) {
                if (entity.interactingOffsets.x === this.interactingOffsets.x && entity.interactingOffsets.y === this.interactingOffsets.y) {
                    if (entity.id < this.id) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    playAudio(instance) {
        if (EntityInformation.getClientEntity() !== this) {
            const position = this.getPosition();
            instance.setPannerPosition(position.x * AudioInformation.SCALE, position.y * AudioInformation.SCALE, 0);
        }
        instance.play();
        this.audio.push(instance);
    }

    getFrontPoint(mul) {
        mul = mul || 1;
        const position = this.getPosition();
        const distance = 20 * mul;

        const point = Vec2.copy(position);
        if (this.animUp) point.y -= distance;
        if (this.animDown) point.y += distance;
        if (this.animLeft) point.x -= distance;
        if (this.animRight) point.x += distance;
        return point;
    }

    getInterpolatedPosition() {
        if (this.t2 === this.t1) {
            return this.p2 || new Vec2();
        }
        if (!this.t1 || !this.t2) {
            return this.p2 || new Vec2();
        }

        const t = Math.max(Math.min((Loop.time - Loop.TICK * 2 - this.t1) / (this.t2 - this.t1), 1), 0);

        return MathHelper.hermite(this.p1, this.p2, this.v1, this.v2, t, 1);
    }

    setInterpolatedPositionVelocity(position, velocity) {
        this.setPosition(position);
        this.setVelocity(velocity);

        if (this.t2 === Loop.time) {
            this.p2.copy(position);
            this.v2.copy(velocity);
        } else {
            this.t1 = this.t2;
            this.t2 = Loop.time;

            this.p1.copy(this.p2);
            this.p2.copy(position);

            this.v1.copy(this.v2);
            this.v2.copy(velocity);
        }
    }

    getPosition() {
        return this.position_;
    }

    setPosition(vec) {
        this.position_.x = vec.x;
        this.position_.y = vec.y;
    }

    getVelocity() {
        return this.velocity_;
    }

    setVelocity(vec) {
        this.velocity_.x = vec.x;
        this.velocity_.y = vec.y;
    }

    queueVoice(floats) {
        if (!MainMenu.voiceChatEnabled) {
            return;
        }

        for (let i = 0; i < floats.length; i++) {
            this.queuedVoiceReceive[this.queuedVoiceReceiveWriteIndex] = floats[i]
            this.queuedVoiceReceiveWriteIndex = (this.queuedVoiceReceiveWriteIndex + 1) % this.queuedVoiceReceive.length;
        }
    }

    /*
    it should work like
    the queuedVoiceReceivePlayIndex is constantly going
    if it CAN read from the queuedVoiceReceive it will write that and replace it with 0
    */

    writeVoice(length) {
        if (!this.voice) {
            this.queuedVoiceReceivePlayIndex = (this.queuedVoiceReceivePlayIndex + length) % this.queuedVoiceReceive.length;
        } else {
            let readLength = this.queuedVoiceReceiveWriteIndex - this.queuedVoiceReceiveReadIndex;
            if (readLength > 0) {
                this.lastTalkTime = Loop.time;
            }
            while (readLength < 0) {
                readLength += this.queuedVoiceReceive.length;
            }
            readLength = Math.min(readLength, length);

            this.actualWriteBytes.length = length;
            for (let i = 0; i < readLength; i++) {
                this.actualWriteBytes[i] = this.queuedVoiceReceive[this.queuedVoiceReceiveReadIndex];
                this.queuedVoiceReceiveReadIndex = (this.queuedVoiceReceiveReadIndex + 1) % this.queuedVoiceReceive.length;
            }
            for (let i = readLength; i < length; i++) {
                this.actualWriteBytes[i] = 0;
            }

            this.voice.writeBytes(this.actualWriteBytes);
        }
    }

    sendVoice(floats) {
        const start = this.queuedVoiceSend.length;
        this.queuedVoiceSend.length = this.queuedVoiceSend.length + floats.length;

        for (let i = 0; i < floats.length; i++) {
            this.queuedVoiceSend[start + i] = floats[i];
        }
    }

    destroy() {
        this.voice.stop();
        if (this.ghostedRaft) {
            this.ghostedRaft.destroy();
        }
        if (this.ghostedPaddle) {
            this.ghostedPaddle.destroy();
        }
        if (this.ghostedHarpoon) {
            this.ghostedHarpoon.destroy();
        }
        // if (this.ghostedHarpoonAmmo) {
        //     this.ghostedHarpoonAmmo.destroy();
        // }

        if (this.interactingRaftID) {
            this.clearInteraction(true);
        }

        EntityInformation.silentlyRemoveEntity(this.id);
    }
}