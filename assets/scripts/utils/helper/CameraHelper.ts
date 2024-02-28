import { _decorator, Camera, Canvas, CCBoolean, Component, EventKeyboard, EventMouse, EventTouch, game, Input, input, Node, Quat, Size, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraHelper')
export class CameraHelper extends Component {

    @property(Camera)
    camera: Camera;
    @property(Size)
    screenSize: Size = new Size(1, 1);
    @property(CCBoolean)
    enableMouse: boolean = true;

    @property(CCBoolean)
    enableKeyboard: boolean = false;

    private mouseData: {
        isDown: boolean,
        currentPosition: Vec2,
        previousPosition: Vec2,
        turn: Vec2,
    } = {
            isDown: false,
            currentPosition: null,
            previousPosition: null,
            turn: new Vec2(0, 0),
        }

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        if (this.enableMouse) {
            input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }
        if (this.enableKeyboard) {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        if (this.enableMouse) {
            input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }
        if (this.enableKeyboard) {
            input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        }
    }

    private warnCameraNull(): boolean {
        if (!this.camera) {
            console.error("Camera is not initialized");
            return true;
        }
        return false;
    }
    protected onTouchStart(e: EventTouch) {
        if (this.warnCameraNull()) return;
    }

    protected onTouchMove(e: EventTouch) {
        if (this.warnCameraNull()) return;
    }

    protected onTouchEnd(e: EventTouch) {
        if (this.warnCameraNull()) return;
    }

    protected onMouseDown(e: EventMouse) {
        if (this.warnCameraNull()) return;

        this.mouseData.isDown = true;
        this.mouseData.currentPosition = e.getUILocation().clone();
        this.mouseData.previousPosition = e.getUILocation().clone();

    }

    protected onMouseMove(e: EventMouse) {
        if (this.warnCameraNull()) return;
        if (this.mouseData.isDown && e.getButton() === EventMouse.BUTTON_LEFT) {
            this.mouseData.currentPosition = e.getUILocation().clone();
            let changed = e.getUIDelta().multiplyScalar(game.deltaTime);
            this.mouseData.turn.x += changed.x;
            this.mouseData.turn.y += changed.y;
            let rotation = new Vec3();
            this.camera.node.getRotation().getEulerAngles(rotation)

            this.camera.node.setRotationFromEuler(v3(
                this.mouseData.turn.y,
                -this.mouseData.turn.x,
                0
            ));
            this.camera.node.updateWorldTransform();
            // console.log(changed);
        }
    }

    protected onMouseUp(e: EventMouse) {
        if (this.warnCameraNull()) return;
        this.mouseData.isDown = false;
        this.mouseData.currentPosition = null;
        this.mouseData.previousPosition = null;
    }

    protected onMouseWheel(e: EventMouse) {
        if (this.warnCameraNull()) return;
        let frontNode = this.camera.node.getChildByName('Front');
        let backNode = this.camera.node.getChildByName('Back');
        if (!frontNode || !backNode) return;
        let isFront = e.getScrollY() > 0;
        const camPosition = this.camera.node.getPosition();
        if (isFront) {
            camPosition.set(frontNode.getWorldPosition());
        }
        else {

            camPosition.set(backNode.getWorldPosition());
        }
        this.camera.node.setPosition(camPosition);
        this.camera.node.updateWorldTransform();
    }

    protected onKeyDown(e: EventKeyboard) {
        if (this.warnCameraNull()) return;
    }

    protected onKeyUp(e: EventKeyboard) {
        if (this.warnCameraNull()) return;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


