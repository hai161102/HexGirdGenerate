import { _decorator, CCBoolean, CCFloat, Component, instantiate, log, MeshCollider, MeshRenderer, ModelRenderer, Node, Prefab, renderer, v2, Vec2, Vec3 } from 'cc';
import Perlin from '../utils/noises/Perlin';
const { ccclass, property } = _decorator;

@ccclass('WorldGenerate')
export class WorldGenerate extends Component {
    @property(Node)
    mapParentNode: Node;
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
        this.calculateTileSize();
        this.generate(this.gridSize.y, this.gridSize.x);
    }

    private perlinNoise = new Perlin();

    private tileSize: Vec3 = new Vec3();
    private mapSize: Vec3 = new Vec3();

    protected onLoad(): void {
        // Perlin.frequency = 100;                  
        this.perlinNoise.resetOutputRange();
        // this.perlinNoise.scale = this.range;
        this.perlinNoise.setOutputRange(this.rangeMin, this.rangeMax);
        this.calculateTileSize();
        this.generate(this.gridSize.y * 3, this.gridSize.x * 3);
    }

    private calculateTileSize() {
        let hexTileNode = instantiate(this.hexTilePrefab);
        hexTileNode.setScale(this.scaleTile, this.scaleTile, this.scaleTile);
        const meshRenderer = hexTileNode.getComponentInChildren(MeshRenderer);
        meshRenderer.mesh.initialize();
        console.log(meshRenderer.model)
        
        const collider: MeshCollider = hexTileNode.getComponentInChildren(MeshCollider);
        this.tileSize.set(
            collider.worldBounds.halfExtents.x * 2,
            collider.worldBounds.halfExtents.y * 2,
            collider.worldBounds.halfExtents.z * 2
        )
    }

    private generate(cols: number, rows: number) {
        this.mapParentNode.removeAllChildren();
        let indexRow: number = 0;
        let indexCol: number = 0;
        this.mapSize.set(
            (this.tileSize.x) * cols * Math.cos(Math.PI / 6),
            this.tileSize.y,
            (this.tileSize.z) * rows
        )
        const radius = Math.max(this.mapSize.x, this.mapSize.y, this.mapSize.z) / 2;
        while (indexRow < rows && indexCol < cols) {

            const position = new Vec2(
                this.tileSize.x * indexCol * Math.cos(Math.PI / 6),
                this.tileSize.z * indexRow + (indexCol % 2 === 1 ? this.tileSize.z * 0.5 : 0)
            );
            let noise = this.perlinNoise.getValue2D(position.x / this.frequency, position.y / this.frequency);
            let isWater = noise < this.threshold;
            position.subtract2f(
                this.mapSize.x / 2,
                this.mapSize.z / 2
            );
            if (!isWater && position.length() <= radius) {
                this.addTile(new Vec3(position.x, 0, position.y));
            }
            indexCol++;
            if (indexCol >= cols) {
                indexCol = 0;
                indexRow++;
            }
        }
    }

    private addTile(position: Vec3) {
        let hexTileNode = instantiate(this.hexTilePrefab);
        this.mapParentNode.addChild(hexTileNode);
        hexTileNode.setScale(this.scaleTile, this.scaleTile, this.scaleTile);
        hexTileNode.setPosition(position.x, position.y, position.z);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


