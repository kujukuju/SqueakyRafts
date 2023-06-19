class Logic {
    static raftSpeed = -0.12;

    static hasSpawned = false;

    static update() {
        if (!Connection.isReady()) {
            return;
        }

        if (!Logic.hasSpawned && !EntityInformation.getClientEntity()) {
            Packets.writeEmptyPacket();
            const spawnPoint = IslandManager.getSpawnPoint();
            if (spawnPoint) {
                Logic.hasSpawned = true;
                const id = Math.floor(Math.random() * 2147483647) + 1;
                EntityInformation.setClientEntityID(id);
                const entity = EntityInformation.addEntity(id, new PlebEntity(true));
                entity.setPosition(spawnPoint);
            }
        }

        PacketProcessor.update();

        MobileControls.update();

        EntityInformation.destroyUnresponsiveEntities();

        // this should be basically first
        RaftManager.destroyInactiveRafts();
        RaftManager.update();

        EntityInformation.update();
        SharkManager.update();
        WoodManager.update();
        RockManager.update();
        Environment.update();
        HarpoonBulletManager.update();
        GunBulletManager.update();
        PlebDeathManager.update();

        PhysicsManager.update();
        
        // update physics
        if (Information.moon) {
            for (let i = 0; i < RaftManager.rafts.length; i++) {
                const raft = RaftManager.rafts[i];
                
                for (let a = 0; a < raft.paddles.length; a++) {
                    const paddle = raft.paddles[a];
    
                    if (paddle.paddling) {
                        const point = raft.getPositionFromOffsets(paddle.offsetX, paddle.offsetY);
                        const dir = paddle.getWorldFacingVector(raft);
    
                        raft.applyForceAtPoint(point, dir.mul(Logic.raftSpeed));
                    }
                }
            }

            RaftManager.moveAwayFromIslands();
        }

        EntityInformation.render();

        InstructionPage.update();
        MapManager.update();
        WinManager.update();
        MainMenu.update();
        DeathScreen.update();
        AudioInformation.update();
        WaitScreen.update();

        CullOptimizer.update();

        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity) {
            Camera.setPosition(clientEntity.getPosition());
        }
        Camera.update();
        ParallaxManager.update();

        if (Packets.bytes.length > 0) {
            Connection.send(Packets.bytes);
            Packets.clear();
        }

        // if (window.debugMode) {
            // Logic.debugPolygons();
            // Logic.debugPoints();
            // Logic.debugMovement();
            // Logic.debugSponges();
            // Logic.debugKelp();
            // Logic.debugHoleA();
            // Logic.debugHoleB();
            // Logic.debugHoleC();
            // Logic.debugSunkenShip();

            // if (Input.keys[Input.KEY_R] & Input.DELTA_DOWN) {
            //     console.log(JSON.stringify([Camera.getMousePosition().x, Camera.getMousePosition().y]));
            // }
        // }

        Input.clear();
        MobileControls.clear();
    }

    // static sunkenShipPoints = [];

    // static debugSunkenShip() {
    //     if (!Input.keys[Input.KEY_Y]) {
    //         if (Logic.sunkenShipPoints.length > 0) {
    //             for (let i = 0; i < Logic.sunkenShipPoints.length; i++) {
    //                 Logic.sunkenShipPoints[i] = [Logic.sunkenShipPoints[i].x, Logic.sunkenShipPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.sunkenShipPoints));
    //             Logic.sunkenShipPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.sunkenShipPoints.push(mouse);
    //         const sponge = new SunkenShip();
    //         sponge.position.x = mouse.x;
    //         sponge.position.y = mouse.y;
    //     }
    // }

    // static holeAPoints = [];

    // static debugHoleA() {
    //     if (!Input.keys[Input.KEY_H]) {
    //         if (Logic.holeAPoints.length > 0) {
    //             for (let i = 0; i < Logic.holeAPoints.length; i++) {
    //                 Logic.holeAPoints[i] = [Logic.holeAPoints[i].x, Logic.holeAPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.holeAPoints));
    //             Logic.holeAPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.holeAPoints.push(mouse);
    //         new HoleA(mouse);
    //     }
    // }

    // static holeBPoints = [];

    // static debugHoleB() {
    //     if (!Input.keys[Input.KEY_J]) {
    //         if (Logic.holeBPoints.length > 0) {
    //             for (let i = 0; i < Logic.holeBPoints.length; i++) {
    //                 Logic.holeBPoints[i] = [Logic.holeBPoints[i].x, Logic.holeBPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.holeBPoints));
    //             Logic.holeBPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.holeBPoints.push(mouse);
    //         new HoleB(mouse);
    //     }
    // }

    // static holeCPoints = [];

    // static debugHoleC() {
    //     if (!Input.keys[Input.KEY_K]) {
    //         if (Logic.holeCPoints.length > 0) {
    //             for (let i = 0; i < Logic.holeCPoints.length; i++) {
    //                 Logic.holeCPoints[i] = [Logic.holeCPoints[i].x, Logic.holeCPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.holeCPoints));
    //             Logic.holeCPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.holeCPoints.push(mouse);
    //         new HoleC(mouse);
    //     }
    // }

    // static kelpPoints = [];

    // static debugKelp() {
    //     if (!Input.keys[Input.KEY_B]) {
    //         if (Logic.kelpPoints.length > 0) {
    //             for (let i = 0; i < Logic.kelpPoints.length; i++) {
    //                 Logic.kelpPoints[i] = [Logic.kelpPoints[i].x, Logic.kelpPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.kelpPoints));
    //             Logic.kelpPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.kelpPoints.push(mouse);
    //         const sponge = new Kelp();
    //         sponge.position.x = mouse.x;
    //         sponge.position.y = mouse.y;
    //     }
    // }

    // static spongePoints = [];

    // static debugSponges() {
    //     if (!Input.keys[Input.KEY_G]) {
    //         if (Logic.spongePoints.length > 0) {
    //             for (let i = 0; i < Logic.spongePoints.length; i++) {
    //                 Logic.spongePoints[i] = [Logic.spongePoints[i].x, Logic.spongePoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.spongePoints));
    //             Logic.spongePoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.spongePoints.push(mouse);
    //         const sponge = new PinkSponge();
    //         sponge.position.x = mouse.x;
    //         sponge.position.y = mouse.y;
    //     }
    // }

    // static placementPoints = [];

    // static debugPoints() {
    //     if (!Input.keys[Input.KEY_R]) {
    //         if (Logic.placementPoints.length > 0) {
    //             for (let i = 0; i < Logic.placementPoints.length; i++) {
    //                 Logic.placementPoints[i] = [Logic.placementPoints[i].x, Logic.placementPoints[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.placementPoints));
    //             Logic.placementPoints.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 12, mouse.y - 12, 24, 24, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.placementPoints.push(mouse);
    //     }

    //     for (let i = 0; i < Logic.placementPoints.length; i++) {
    //         const current = Logic.placementPoints[i];
    //         Renderer.debug.drawRect(current.x - 12, current.y - 12, 24, 24, 0xffffff, 1);
    //     }
    // }

    // static points = [];

    // static debugPolygons() {
    //     if (!Input.keys[Input.KEY_F]) {
    //         if (Logic.points.length > 0) {
    //             for (let i = 0; i < Logic.points.length; i++) {
    //                 Logic.points[i] = [Logic.points[i].x, Logic.points[i].y];
    //             }
    //             console.log(JSON.stringify(Logic.points));
    //             Logic.points.length = 0;
    //         }

    //         return;
    //     }

    //     const mouse = Camera.getMousePosition();
    //     Renderer.debug.drawRect(mouse.x - 4, mouse.y - 4, 8, 8, 0xffffff, 1);

    //     if (Input.mouseDownLeft & Input.DELTA_DOWN) {
    //         Logic.points.push(mouse);
    //     }

    //     for (let i = 0; i < Logic.points.length; i++) {
    //         const current = Logic.points[i];
    //         const next = Logic.points[(i + 1) % Logic.points.length];
    //         Renderer.debug.drawLine(current.x, current.y, next.x, next.y, 0xffffff, 1);
    //     }

    //     if (Logic.points.length > 0) {
    //         const current = Logic.points[Logic.points.length - 1];
    //         Renderer.debug.drawLine(current.x, current.y, mouse.x, mouse.y, 0xffffff, 1);
    //     }
    // }

    // static debugMovement() {
    //     const accel = new Vec2();
    //     if (Input.keys[Input.KEY_W]) {
    //         accel.y -= 1;
    //     }
    //     if (Input.keys[Input.KEY_S]) {
    //         accel.y += 1;
    //     }
    //     if (Input.keys[Input.KEY_A]) {
    //         accel.x -= 1;
    //     }
    //     if (Input.keys[Input.KEY_D]) {
    //         accel.x += 1;
    //     }

    //     const entity = EntityInformation.getClientEntity();
    //     if (entity) {
    //         const position = entity.getPosition();
    //         entity.setPosition(Vec2.copy(position).add(accel.mul(40)));
    //     }
    // }
}

// const debugMode = () => {
//     Camera.setScale(new Vec2(0.8, 0.8));
//     window.debugMode = true;
// };