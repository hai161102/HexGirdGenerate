import { _decorator, CCBoolean, CCFloat, Component, instantiate, MeshCollider, Node, Prefab, sp, v2, Vec2 } from 'cc';
import Perlin from './utils/noises/Perlin';
const { ccclass, property } = _decorator;


@ccclass('Main')
export class Main extends Component {

    @property(Node)
    mapParentNode : Node;
    @property(Prefab)
    hexTilePrefab: Prefab;
    @property(Vec2)
    gridSize: Vec2 = new Vec2(10, 10);
    @property(CCFloat)
    spaceTile: number = 0;
    @property(CCFloat)
    scaleTile: number = 1;
    @property(CCFloat)
    rangeMin: number = 0;
    @property(CCFloat)
    rangeMax: number = 1;
    @property(CCFloat)
    frequency: number = 100;
    @property(CCFloat)
    threshold: number = 0;

    private _resetView: boolean;
    public get resetView(): boolean {
        return this._resetView;
    }
    @property({ type: CCBoolean })
    public set resetView(value: boolean) {
        this._resetView = false;
        // this.generate(8, 8);
        this.perlinNoise.resetOutputRange();
        this.perlinNoise.setOutputRange(this.rangeMin, this.rangeMax);
        this.generate(this.gridSize.y, this.gridSize.x);
    }

    perlinNoise = new Perlin();



    protected onLoad(): void {
        // Perlin.frequency = 100;                  
        this.perlinNoise.resetOutputRange();
        // this.perlinNoise.scale = this.range;
        this.perlinNoise.setOutputRange(this.rangeMin, this.rangeMax);
        // this.generate(this.gridSize.y, this.gridSize.x);
    }

    private generate(cols: number, rows: number) {
        this.mapParentNode.removeAllChildren();
        let indexRow: number = 0;
        let indexCol: number = 0;

        while (indexRow < rows && indexCol < cols) {
            let hexTileNode = instantiate(this.hexTilePrefab);
            this.mapParentNode.addChild(hexTileNode);
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
            let noise = this.perlinNoise.getValue2D(position.x / this.frequency, position.y / this.frequency);
            hexTileNode.setPosition(position.x - rows * size.x * 3 / 8, 0, position.y - cols * size.y / 2);
            let isWater = noise < this.threshold;
            if (isWater) {
                this.mapParentNode.removeChild(hexTileNode)
            }
            indexRow++;
            if (indexRow >= rows) {
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


