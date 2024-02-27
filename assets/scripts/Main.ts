import { _decorator, CCBoolean, CCFloat, Component, instantiate, MeshCollider, Node, Prefab, sp, v2, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

let ws: WebSocket;

@ccclass('Main')
export class Main extends Component {

    @property(Prefab)
    hexTilePrefab: Prefab;

    @property(CCFloat)
    spaceTile: number = 0;

    @property(CCFloat)
    scaleTile: number = 1;

    @property(CCFloat)
    noiseFrequency: number = 100;
    @property(CCFloat)
    noiseThreshold: number = 0.5;

    private _resetView: boolean;
    public get resetView(): boolean {
        return this._resetView;
    }
    @property({ type: CCBoolean })
    public set resetView(value: boolean) {
        this._resetView = false;
        this.generate(8, 8);
    }

    dataSendtoServer: { id: string, x: number, y: number }[] = []

    protected onLoad(): void {
        ws = new WebSocket('ws://localhost:1313');
        ws.addEventListener('open', (ev: Event) => {
            console.log('Open Socket', ev);
            this.generate(24, 24);
            ws.send(JSON.stringify(this.dataSendtoServer));

        })
        ws.addEventListener('close', (ev: Event) => {
            console.log('Close Socket', ev);
        })
        ws.addEventListener('error', (ev: Event) => {
            console.log('Error Socket', ev);
        })
        ws.addEventListener('message', (ev: MessageEvent) => {
            const data : {id: string, noise: number}[] = JSON.parse(ev.data);
            if (data) {
                data.forEach(value => {
                    const child = this.node.getChildByUuid(value.id)
                    if (child) {
                        if (parseFloat(value.noise.toString()) < this.noiseThreshold) {
                            child.removeFromParent();
                        }
                    }
                })
                
            }
        })
    }

    private generate(row: number, col: number) {
        this.node.removeAllChildren();
        let indexRow: number = 0;
        let indexCol: number = 0;

        while (indexRow < row && indexCol < col) {
            let hexTileNode = instantiate(this.hexTilePrefab);
            this.node.addChild(hexTileNode);
            hexTileNode.setScale(this.scaleTile, this.scaleTile, this.scaleTile);
            const collider: MeshCollider = hexTileNode.getComponentInChildren(MeshCollider);
            const size = v2(
                collider.worldBounds.halfExtents.x * 2 * this.scaleTile,
                collider.worldBounds.halfExtents.z * 2 * this.scaleTile
            )
            const position = new Vec2(
                (size.x + this.spaceTile) * indexRow * 3 / 4,
                (size.y + this.spaceTile) * indexCol + (indexRow % 2 === 1 ? (size.y + this.spaceTile) * 0.5 : 0)
            );
            hexTileNode.setPosition(position.x, 0, position.y);
            this.dataSendtoServer.push({
                id: hexTileNode.uuid,
                x: position.x / this.noiseFrequency,
                y: position.y / this.noiseFrequency
            })
            // let noise = this._simplexNoise.noise(position.x / this.noiseFrequency, position.y / this.noiseFrequency)
            // let isWater = noise < this.noiseThreshold;
            // if (isWater) {
            //     this.node.removeChild(hexTileNode)
            // }
            indexRow++;
            if (indexRow >= row) {
                indexRow = 0;
                indexCol++;
            }
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


