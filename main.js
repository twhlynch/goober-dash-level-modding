//#region classes

class Level {
    constructor(json = undefined) {
        this.metadata = {
            "author_id": "",
            "author_name": "",
            "game_mode": "Race",
            "id": "",
            "name": "New GDLM Level",
            "player_count": 0,
            "published": "Private",
            "rating": 0,
            "rating_count": 0,
            "theme": "grassy",
            "type": 0
        }
        this.nodes = [];
        if (json) {
            this.metadata = json.metadata;
            for (const node of json.nodes) {
                this.add(new Node(node));
            }
        }
        console.log(this.get());
    }
    get() {
        const jsonNodes = [];
        for (const node of this.nodes) {
            jsonNodes.push(node.get());
        }
        return {
            "metadata": this.metadata,
            "nodes": jsonNodes
        }
    }
    save() {
        const json = JSON.stringify(this.get());
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "GDLM-" + new Date().getTime() + ".json";
        a.click();
    }
    add(node) {
        this.nodes.push(node);
    }
}

class Node {
    constructor(json = undefined) {
        this.x = 0,
        this.y = 0,
        this.height = 1,
        this.width = 1,
        this.pivot_x = 0.5,
        this.pivot_y = 0.5,
        this.rotation = 0,
        this.shape_rotation = 0,
        this.type = "block"

        this.properties = {};
        this.animation = {};

        if (json) {
            for (const key in json) {
                this[key] = json[key];
            }
        }
    }
    get() {
        let json = {
            "x": this.x,
            "y": this.y,
            "height": this.height,
            "width": this.width,
            "pivot_x": this.pivot_x,
            "pivot_y": this.pivot_y,
            "rotation": this.rotation,
            "shape_rotation": this.shape_rotation,
            "type": this.type
        }
        // NOTE: {} != {} is true
        if (this.properties && Object.keys(this.properties).length !== 0) {
            json.properties = this.properties;
        }
        if (this.animation && Object.keys(this.animation).length !== 0) {
            json.animation = this.animation;
        }
        return json;
    }
}

//#region types

const themes = [
    "castle",
    "city",
    "dungeon",
    "grassy",
    "green",
    "meadow",
    "snow"
];

const nodeTypes = [
    "block",
    "floor",
    "start",
    "finish_line",
    "checkpoint",
    "pit",
    "sawblade",
    "ramp",
    "gravity_field",
    "alert",
    "arrow",
    "background",
    "background2",
    "background3",
    "background_ramp",
    "background_ramp2",
    "bouncy_block",
    "disappearing_block",
    "ice_block",
    "jump_zone",
    "laser",
    "music_block",
    "physics_block",
    "recharger",
    "sign"
];

const nodeTypeColors = {
    "alert": {r: 183, g: 154, b: 228},
    "arrow": {r: 190, g: 164, b: 230},
    "background": {r: 83, g: 30, b: 117},
    "background2": {r: 68, g: 85, b: 125},
    "background3": {r: 95, g: 189, b: 99},
    "background_ramp": {r: 83, g: 30, b: 117},
    "background_ramp2": {r: 96, g: 110, b: 147},
    "block": {r: 240, g: 147, b: 249},
    "bouncy_block": {r: 132, g: 82, b: 209},
    "checkpoint": {r: 216, g: 185, b: 231},
    "disappearing_block": {r: 191, g: 234, b: 163},
    "finish_line": {r: 212, g: 174, b: 231},
    "floor": {r: 208, g: 153, b: 235},
    "gravity_field": {r: 221, g: 190, b: 232},
    "ice_block": {r: 118, g: 162, b: 238},
    "jump_zone": {r: 113, g: 99, b: 153},
    "laser": {r: 219, g: 147, b: 249},
    "music_block": {r: 249, g: 222, b: 240},
    "physics_block": {r: 177, g: 177, b: 177},
    "pit": {r: 241, g: 246, b: 253},
    "ramp": {r: 218, g: 182, b: 222},
    "recharger": {r: 101, g: 133, b: 179},
    "sawblade": {r: 204, g: 217, b: 231},
    "sign": {r: 205, g: 211, b: 220},
    "start": {r: 202, g: 198, b: 216}
};

//#region setup

function init() {
    // sliders
    const sliders = document.querySelectorAll("input[type=range]");
    for (let i = 0; i < sliders.length; i++) {
        const slider = sliders[i];
        slider.addEventListener("input", () => {
            slider.setAttribute("value", slider.value);
        });
    }

    /* Generate average colors for nodeTypeColors
    for (let type in nodeTypeColors) {
        const filename = "sprites/" + type + ".png";
        const img = new Image();
        img.src = filename;
        img.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
            const pixelData = ctx.getImageData(0, 0, 1, 1).data;
            nodeTypeColors[type] = {
                "r": pixelData[0],
                "g": pixelData[1],
                "b": pixelData[2]
            };
        }
    }*/
}

//#region generation

function generateGrid() {
    const xSize = parseInt(document.getElementById("grid-size-x").value);
    const ySize = parseInt(document.getElementById("grid-size-y").value);
    const gapSize = parseInt(document.getElementById("grid-size-gap").value);

    const level = new Level();

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            const node = new Node();
            node.x = x * gapSize;
            node.y = y * gapSize;
            level.add(node);
        }
    }

    level.save();
}

function generatePixelArt() {
    const xSize = parseInt(document.getElementById("pixel-art-size-x").value);
    const ySize = parseInt(document.getElementById("pixel-art-size-y").value);
    const file = document.getElementById("pixel-art-image").files[0];
    const optimise = document.getElementById("pixel-art-optimise").checked;
    const doubleLayer = document.getElementById("pixel-art-double-layer").checked;

    const noPixel = [
        "physics_block", // lag
        "start" // min 3x3
    ];
    const noOptimise = [
        "background3", // no scale y
        "laser", // no scale
        "checkpoint", // no scale y
        "finish_line", // no scale y
        "floor", // no scale y
        "pit", // no scale y
        "music_block", // no scale
        "recharger", // no scale
        "sign", // no scale
    ];

    const canvas = document.createElement("canvas");
    canvas.width = xSize;
    canvas.height = ySize;
    const ctx = canvas.getContext("2d");

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let image = new Image();
        image.onload = function() {
            ctx.drawImage(image, 0, 0, xSize, ySize);
            const imageData = ctx.getImageData(0, 0, xSize, ySize);

            const level = new Level();

            // generate pixels

            const pixelNodes = [];

            for (let y = 0; y < ySize; y++) {
                for (let x = 0; x < xSize; x++) {
                    const index = (x + y * xSize) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];
                    const a = imageData.data[index + 3];

                    if (a === 0) {
                        continue;
                    }

                    let bestMatch = undefined;
                    let bestMatchDistance = Infinity;
                    let secondMatch = undefined;

                    for (let type in nodeTypeColors) {
                        if (noPixel.includes(type)) {
                            continue;
                        }
                        if (optimise && noOptimise.includes(type)){
                            continue;
                        }

                        const color = nodeTypeColors[type];
                        const distance = Math.sqrt(
                            Math.pow(color.r - r, 2) +
                            Math.pow(color.g - g, 2) +
                            Math.pow(color.b - b, 2)
                        );
                        
                        if (distance < bestMatchDistance) {
                            bestMatch = type;
                            bestMatchDistance = distance;
                        }
                    }

                    // compare to combinations

                    if (doubleLayer) {
                        for (let type1 in nodeTypeColors) {
                            for (let type2 in nodeTypeColors) {
                                if (noPixel.includes(type1) || noPixel.includes(type2)) {
                                    continue;
                                }
                                if (optimise && (noOptimise.includes(type1) || noOptimise.includes(type2))) {
                                    continue;
                                }

                                const color1 = nodeTypeColors[type1];
                                const color2 = nodeTypeColors[type2];
                                const color = {
                                    "r": (color1.r + color2.r) / 2,
                                    "g": (color1.g + color2.g) / 2,
                                    "b": (color1.b + color2.b) / 2
                                }
                                const distance = Math.sqrt(
                                    Math.pow(color.r - r, 2) +
                                    Math.pow(color.g - g, 2) +
                                    Math.pow(color.b - b, 2)
                                );
                                
                                if (distance < bestMatchDistance) {
                                    bestMatch = type1;
                                    secondMatch = type2;
                                    bestMatchDistance = distance;
                                }

                            }
                        }
                    }

                    if (bestMatch) {
                        const node = new Node();
                        node.type = bestMatch;
                        node.x = x;
                        node.y = y;
                        pixelNodes.push(node);
                    }

                    if (secondMatch) {
                        const node = new Node();
                        node.type = secondMatch;
                        node.x = x;
                        node.y = y;
                        pixelNodes.push(node);
                    }
                }
            }

            // optimise neighbors

            if (optimise) {
                // TODO: flood fill
            }

            pixelNodes.forEach(node => {
                level.add(node);
            });
            level.save();
        }
        image.src = data;
    }
    reader.readAsDataURL(file);
}

function generateImpossibleGravity() {
    const strength = parseInt(document.getElementById("impossible-gravity-strength").value);

    const level = new Level();

    const node = new Node();
    node.type = "gravity_field";
    node.properties = {
        "rotation": 0,
        "strength": strength
    };
    level.add(node);

    level.save();
}

function modifyMirrorLevel() {
    const vertical = document.getElementById("mirror-level-vertical").checked;
    const horizontal = document.getElementById("mirror-level-horizontal").checked;
    const file = document.getElementById("mirror-level-level").files[0];

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (node.animation?.tween_sequences?.position) {
                node.animation.tween_sequences.position.tweens.forEach(tween => {
                    if (tween.value_type === 5) { // 5 is translate
                        if (vertical) {
                            tween.value_y = -tween.value_y;
                        }
                        if (horizontal) {
                            tween.value_x = -tween.value_x;
                        }
                    }
                });
            }
            if (node.animation?.tween_sequences?.rotation_degrees) {
                node.animation.tween_sequences.rotation_degrees.tweens.forEach(tween => {
                    if (tween.value_type === 3) { // 3 is rotate
                        tween.value = -tween.value;
                    }
                });
            }

            if (vertical) {
                node.y = -node.y - node.height;
                node.rotation += 180;
                node.pivot_y = 1 - node.pivot_y;
            }
            if (horizontal) {
                node.x = -node.x - node.width;
                node.rotation = -node.rotation;
                node.pivot_x = 1 - node.pivot_x;
            }
            if (node.type.includes("ramp")) {
                node.shape_rotation = 3 - node.shape_rotation; // 0, 1, 2, 3
            }
        });

        level.save();
    }
    reader.readAsText(file);
}

function modifyScaleLevel() {
    const scale = parseInt(document.getElementById("scale-level-scale").value);
    const file = document.getElementById("scale-level-level").files[0];

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            node.x *= scale;
            node.y *= scale;
            node.width *= scale;
            node.height *= scale;
        });
        // TODO: fix non-y-scalable nodes floating

        level.save();
    }
    reader.readAsText(file);
}

//#region runtime

init();

//#region events

document.getElementById("generate-grid").addEventListener("click", generateGrid);
document.getElementById("generate-pixel-art").addEventListener("click", generatePixelArt);
document.getElementById("generate-impossible-gravity").addEventListener("click", generateImpossibleGravity);
document.getElementById("modify-scale-level").addEventListener("click", modifyScaleLevel);
document.getElementById("modify-mirror-level").addEventListener("click", modifyMirrorLevel);