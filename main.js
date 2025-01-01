//#region classes

class Level {
    constructor(json = undefined) {
        this.metadata = {
            "author_id": "",
            "author_name": "",
            "game_mode": "Race",
            "id": "",
            "name": "",
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
        a.download = "GDLM-" + new Date().getTime().toString().substring(6, 9) + " " + this.metadata.name + ".json";
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

    //To top
    const toTop = document.getElementById("toTop");
    if (toTop) {
        toTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // Tabs
    const params = new URLSearchParams(window.location.search);
    let currentTab = params.get("tab") || "tools";
    const tabs = document.querySelectorAll('#tabs > button');
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((tab) => {
                tab.classList.remove("active");
                const content = document.getElementById(`${tab.id}-content`);
                content.style.display = "none";
            });
            tab.classList.add("active");
            const content = document.getElementById(`${tab.id}-content`);
                content.style.display = "block";
            currentTab = tab.id;
            window.history.pushState({}, "", `?tab=${currentTab}${window.location.hash}`);
        });
        if (tab.id === currentTab) {
            tab.click();
        }
    });

    // advanced pixel art options
    const advancedOptions = document.getElementById("pixel-art-advanced-options");
    const advancedCheckbox = document.getElementById("pixel-art-advanced");
    advancedCheckbox.addEventListener("change", () => {
        advancedOptions.style.display = advancedCheckbox.checked? "grid" : "none";
    });

    // advanced circle options
    const circleAdvancedOptions = document.getElementById("circle-advanced-options");

    for (let type of nodeTypes) {
        advancedOptions.innerHTML += `
        <div class="checkbox">
            <input type="checkbox" name="pixel-art-advanced-${type}" id="pixel-art-advanced-${type}">
            <label for="pixel-art-advanced-${type}">${type.replaceAll("_", " ")}</label>
        </div>
        `;
        circleAdvancedOptions.innerHTML += `
        <div class="checkbox">
            <input type="checkbox" name="circle-advanced-${type}" id="circle-advanced-${type}">
            <label for="circle-advanced-${type}">${type.replaceAll("_", " ")}</label>
        </div>
        `;
    }

    // options for swap from and to
    const from = document.getElementById("swap-level-from");
    const to = document.getElementById("swap-level-to");

    for (let type of nodeTypes) {
        from.innerHTML += `
        <option value="${type}">${type.replaceAll("_", " ")}</option>
        `;
        to.innerHTML += `
        <option value="${type}">${type.replaceAll("_", " ")}</option>
        `;
    }

    //images for help
    const blockDefs = document.getElementById("block-defs");
    for (let type of nodeTypes) {
        blockDefs.innerHTML += `
        <span>
            <span>${type.replaceAll("_", " ")}</span>
            <img src="sprites/${type}.png" alt="${type}">
        </span>
        `;
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

    level.metadata.name = "Grid";
    level.save();
}

function generateCircle() {
    const angle = parseInt(document.getElementById("circle-angle").value);
    const radius = parseInt(document.getElementById("circle-radius").value);
    const width = parseInt(document.getElementById("circle-width").value);
    const fullSpin = document.getElementById("circle-full-spin").checked;

    const selectedAdvancedOptions = [];
    nodeTypes.forEach(type => {
        const typeOption = document.getElementById("circle-advanced-" + type);

        if (typeOption && typeOption.checked) {
            selectedAdvancedOptions.push(type);
        }
    });

    const level = new Level();

    for (let i = 0; i < selectedAdvancedOptions.length; i++) {
        const option = selectedAdvancedOptions[i];
        const position = 2 * radius * i * 1.5;

        for (let j = 0; j <= (fullSpin ? 360 : 180); j += angle) {
            const node = new Node();
            node.type = option;
            node.x = position;
            node.y = 0;
            node.width = radius * 2;
            node.height = width;
            node.rotation = j;
            level.add(node);
        }
    }

    level.metadata.name = "Circle";
    level.save();
}

function generatePixelArt() {
    const xSize = parseInt(document.getElementById("pixel-art-size-x").value);
    const ySize = parseInt(document.getElementById("pixel-art-size-y").value);
    const file = document.getElementById("pixel-art-image").files[0];
    const optimise = document.getElementById("pixel-art-optimise").checked;
    const doubleLayer = document.getElementById("pixel-art-double-layer").checked;
    const backgroundOnly = document.getElementById("pixel-art-background").checked;
    const advanced = document.getElementById("pixel-art-advanced").checked;

    const selectedAdvancedOptions = [];
    nodeTypes.forEach(type => {
        const typeOption = document.getElementById("pixel-art-advanced-" + type);

        if (typeOption && typeOption.checked) {
            selectedAdvancedOptions.push(type);
        }
    });

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
    const backgrounds = nodeTypes.filter(type => type.includes("background"));

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
                        if (advanced) {
                            if (!selectedAdvancedOptions.includes(type)) {
                                continue;
                            }
                        } else {
                            if (noPixel.includes(type)) {
                                continue;
                            }
                            if (optimise && noOptimise.includes(type)){
                                continue;
                            }
                            if (backgroundOnly && !backgrounds.includes(type)) {
                                continue;
                            }
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
                                if (advanced) {
                                    if (!selectedAdvancedOptions.includes(type1) || !selectedAdvancedOptions.includes(type2)) {
                                        continue;
                                    }
                                } else {
                                    if (noPixel.includes(type1) || noPixel.includes(type2)) {
                                        continue;
                                    }
                                    if (optimise && (noOptimise.includes(type1) || noOptimise.includes(type2))) {
                                        continue;
                                    }
                                    if (backgroundOnly && (!backgrounds.includes(type1) || !backgrounds.includes(type2))) {
                                        continue;
                                    }
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
            
            level.metadata.name = "Pixel Art";
            level.save();
        }
        image.src = data;
    }
    reader.readAsDataURL(file);
}

function generateVideo() {
    const xSize = parseInt(document.getElementById("video-size-x").value);
    const ySize = parseInt(document.getElementById("video-size-y").value);
    const file = document.getElementById("video-video").files[0];

    const isBinary = document.getElementById("video-binary").checked;

    const noPixel = [
        "physics_block", // lag
        "start" // min 3x3
    ];

    const binary = [
        "block",
        "background"
    ];

    if (isBinary) {
        noPixel.push(...nodeTypes.filter(t => !binary.includes(t) && !noPixel.includes(t)));
    }

    const reader = new FileReader();
    reader.onload = async function() {
        let buffer = reader.result;
        let videoBlob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
        let url = window.URL.createObjectURL(videoBlob);

        const video = document.createElement("video");
        video.src = url;
        video.muted = true;

        await video.play();
        const [track] = video.captureStream().getVideoTracks();
        video.onended = () => track.stop();
        
        const processor = new MediaStreamTrackProcessor(track);
        const videoReader = processor.readable.getReader();

        const generateButton = document.getElementById("generate-video");
        let frames = [];
        
        readChunk();
        function readChunk() {
            videoReader.read().then(async({ done, value }) => {
                if (value) {
                    const bitmap = await createImageBitmap(value);
                    frames.push(bitmap);
                    generateButton.innerText = `Reading Video: ${Math.round(video.currentTime / video.duration * 100)}%`;
                    value.close();
                }
                if (!done) {
                    readChunk();
                } else {
                    let nodeTypeMasks = {};
                    nodeTypes.filter(t => !noPixel.includes(t)).forEach(type => {
                        nodeTypeMasks[type] = [];
                        for (let x = 0; x < xSize; x++) {
                            nodeTypeMasks[type].push([]);
                            for (let y = 0; y < ySize; y++) {
                                let node = new Node();
                                node.type = type;
                                node.x = x;
                                node.y = y;
                                node.animation = {
                                    "offset": 0,
                                    "repeat": true,
                                    "tween_sequences": {
                                        "position": {
                                            "property": "position",
                                            "total_duration": frames.length / 24,
                                            "tweens": []
                                        }
                                    }
                                }
                                node.animation.tween_sequences.position.tweens.push({
                                    "duration": 0,
                                    "ease_type": 0,
                                    "transition": 0,
                                    "value_type": 5,
                                    "value_x": 0,
                                    "value_y": 10000
                                });
                                nodeTypeMasks[type][x].push(node);
                            }
                        }
                    });

                    const lastTypes = [];
                    for (let x = 0; x < xSize; x++) {
                        lastTypes.push([]);
                        for (let y = 0; y < ySize; y++) {
                            lastTypes[x][y] = "";
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = xSize;
                    canvas.height = ySize;
                    const ctx = canvas.getContext("2d");

                    for (let i in frames) {
                        generateButton.innerText = `Generating Nodes: ${Math.round(i / frames.length * 100)}%`;
                        const frame = frames[i];
                        ctx.drawImage(frame, 0, 0, xSize, ySize);
                        const imageData = ctx.getImageData(0, 0, xSize, ySize);

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
            
                                for (let type in nodeTypeColors) {
                                    if (noPixel.includes(type)) {
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
            
                                if (bestMatch) {
                                    const node = nodeTypeMasks[bestMatch][x][y];

                                    let isNodesFirst = node.animation.tween_sequences.position.tweens.length == 1;
                                    let nodePrevFrames = node.animation.tween_sequences.position.tweens.filter((f, fi)=>fi != node.animation.tween_sequences.position.tweens.length - 1);
                                    let nodeTime = 0;
                                    for (let f = 0; f < nodePrevFrames.length; f++) {
                                        nodeTime += nodePrevFrames[f].duration;
                                    }

                                    if (lastTypes[x][y] == bestMatch) {
                                        let len = node.animation.tween_sequences.position.tweens.length;
                                        node.animation.tween_sequences.position.tweens[len - 2].duration += 1 / 24;
                                    } else {
                                        node.animation.tween_sequences.position.tweens.push({
                                            "duration": isNodesFirst ? (i / 24) : (i / 24 - nodeTime),
                                            "ease_type": 0,
                                            "transition": 0,
                                            "value_type": 0
                                        });
                                        node.animation.tween_sequences.position.tweens.push({
                                            "duration": 0,
                                            "ease_type": 0,
                                            "transition": 0,
                                            "value_type": 5,
                                            "value_x": 0,
                                            "value_y": 0
                                        });
                                        node.animation.tween_sequences.position.tweens.push({
                                            "duration": 1 / 24,
                                            "ease_type": 0,
                                            "transition": 0,
                                            "value_type": 0
                                        });
                                        node.animation.tween_sequences.position.tweens.push({
                                            "duration": 0,
                                            "ease_type": 0,
                                            "transition": 0,
                                            "value_type": 5,
                                            "value_x": 0,
                                            "value_y": 10000
                                        });
                                    }
                                    lastTypes[x][y] = bestMatch;
                                }
                            }
                        }
                    }

                    const level = new Level();

                    for (let type in nodeTypeMasks) {
                        for (let x = 0; x < xSize; x++) {
                            for (let y = 0; y < ySize; y++) {
                                const node = nodeTypeMasks[type][x][y];
                                if (node.animation.tween_sequences.position.tweens.length > 1) {
                                    generateButton.innerText = `Building Level: ${Math.round((y + x * ySize) / (xSize * ySize) * 100)}%`;
                                    level.add(node);
                                }
                            }
                        }
                    }
                    
                    level.metadata.name = "Video";
                    generateButton.innerText = "Downloading..";
                    level.save();

                    generateButton.innerText = "Generate Video";
                }
            });
        }
    }
    reader.readAsArrayBuffer(file);
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

    level.metadata.name = "Gravity";
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
                        if (vertical) {
                            tween.value += 90;
                        }
                        if (horizontal) {
                            tween.value = -tween.value;
                        }
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
            for (let _ in [vertical, horizontal].filter(e=>{return e == true})) {
                if (node.type.includes("ramp")) {
                    node.shape_rotation = 3 - node.shape_rotation; // 0, 1, 2, 3
                } else if (node.type == "laser") { // swap 0, and 2
                    node.shape_rotation = node.shape_rotation == 0 ? 2 : node.shape_rotation == 2 ? 0 : node.shape_rotation;
                } else if ([
                    'arrow', 'alert', 'pit', 'gravity_field', 
                    'checkpoint', 'finish_line', 'floor'
                ].includes(node.type)) { // swap 1, and 3
                    node.shape_rotation = node.shape_rotation == 1 ? 3 : node.shape_rotation == 3 ? 1 : node.shape_rotation;
                }
            }
        });

        level.metadata.name += " Mirrored";
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

            if (node.animation?.tween_sequences?.position) {
                node.animation.tween_sequences.position.tweens.forEach(tween => {
                    if (tween.value_type === 5) {
                        tween.value_x *= scale;
                        tween.value_y *= scale;
                    }
                });
            }
        });
        // TODO: fix non-y-scalable nodes floating

        level.metadata.name += " Scaled";
        level.save();
    }
    reader.readAsText(file);
}

function modifySpeedLevel() {
    let speed = parseInt(document.getElementById("speed-level-speed").value);
    const isSlow = document.getElementById("speed-level-slow").checked;
    const file = document.getElementById("speed-level-level").files[0];

    if (isSlow) {
        speed = 1 / speed;
    }

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (node.animation?.tween_sequences?.position) {
                node.animation.tween_sequences.position.total_duration /= speed;
                node.animation.tween_sequences.position.tweens.forEach(tween => {
                    tween.duration /= speed;
                });
            }
            if (node.animation?.tween_sequences?.rotation_degrees) {
                node.animation.tween_sequences.rotation_degrees.total_duration /= speed;
                node.animation.tween_sequences.rotation_degrees.tweens.forEach(tween => {
                    tween.duration /= speed;
                });
            }
        });

        level.metadata.name += isSlow ? " Slowed down" : " Sped Up";
        level.save();
    }
    reader.readAsText(file);
}

function modifyRandomizeLevel() {
    const file = document.getElementById("random-level-level").files[0];

    const noRandom = [
        "start",
        "finish_line", 
        "gravity_field",
        "jump_zone"
    ];

    const filteredTypes = nodeTypes.filter(type => !["start","finish_line"].includes(type));

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (!noRandom.includes(node.type)) {
                node.type = filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
            }
        });

        level.metadata.name += " Randomized";
        level.save();
    }
    reader.readAsText(file);
}

function modifyGravityLevel() {
    const strength = parseInt(document.getElementById("gravity-level-strength").value);
    const file = document.getElementById("gravity-level-level").files[0];

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (node.type === "gravity_field") {
                node.properties.strength = strength;
            }
        });

        level.metadata.name += " Gravity Boost";
        level.save();
    }
    reader.readAsText(file);
}

function modifySwapLevel() {
    const from = document.getElementById("swap-level-from").value;
    const to = document.getElementById("swap-level-to").value;
    const file = document.getElementById("swap-level-level").files[0];

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (node.type === from) {
                node.type = to;
            }
        });

        level.metadata.name += " Swapped";
        level.save();
    }
    reader.readAsText(file);
}

function modifySeparateLevel() {
    const file = document.getElementById("separate-level-level").files[0];

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        level.nodes.forEach(node => {
            if (Object.keys(node.animation).length == 0) {
                node.animation = {
                    "offset": 0,
                    "repeat": true,
                    "tween_sequences": {}
                }
            }
        });

        level.metadata.name += " Separated";
        level.save();
    }
    reader.readAsText(file);
}

async function generateBlockText() {
    let file = document.getElementById("text-font-file").files[0];
    const text = document.getElementById("text-font-text").value;

    if (!file) {
        const r = await fetch("data/Font.json");
        file = await r.blob(); // perhaps a lil silly
    }

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const fontLevel = new Level(levelJSON);

        const level = new Level();
        
        const characters = {
            " ": {
                "width": 1,
                "nodes": []
            }
        };

        let top = Infinity;
        let bottom = -Infinity;

        for (let node of fontLevel.nodes) {
            if (node.type === "sign") {
                if (node.y < top) {
                    top = node.y;
                }
                if (node.y > bottom) {
                    bottom = node.y;
                }
            }
        }

        const height = top - bottom - 2;

        for (let node of fontLevel.nodes) {
            if (node.type === "sign" && node.y === top && node.properties.message.length === 1) {
                const letter = node.properties.message;

                let left = node.x;
                let right = Infinity;
                for (let node2 of fontLevel.nodes) {
                    if (node2.type === "sign") {
                        if (node2.x < right && node2.x > left) {
                            right = node2.x;
                        }
                    }
                }

                const nodes = [];
                for (let node2 of fontLevel.nodes) {
                    if (node2.type !== "sign") {
                        if (node2.x > left && node2.x < right && node2.y > top && node2.y < bottom) {
                            const newNode = new Node(node2.get());
                            newNode.x -= left;
                            nodes.push(newNode);
                        }
                    }
                }

                const charWidth = right - left - 1;
                characters[letter] = {
                    width: charWidth,
                    nodes: nodes
                }

            }
        }

        // create text

        let currentPosition = 0;
        let currentLine = 0;

        for (let char of text) {
            if (char === "\n") {
                currentPosition = 0;
                currentLine++;
                continue;
            }
            let character = characters[char]
                || characters[char.toLowerCase()]
                || characters[char.toUpperCase()]
                || characters[" "];

            for (let node of character.nodes) {
                let newNode = new Node(node.get());
                newNode.x += currentPosition;
                newNode.y -= currentLine * height;
                level.add(newNode);
            }
            currentPosition += character.width + 1;
        }

        level.metadata.name = "Text";
        level.save();
    }
    reader.readAsText(file);
}

function generateCountdown() {
    const start = parseInt(document.getElementById("countdown-start").value);
    const speed = parseInt(document.getElementById("countdown-speed").value);

    const segments = [
        { x: 1, y: 2, width: 3, height: 1 },
        { x: 1, y: 2, width: 1, height: 3 },
        { x: 3, y: 2, width: 1, height: 3 },
        { x: 1, y: 4, width: 3, height: 1 },
        { x: 1, y: 4, width: 1, height: 3 },
        { x: 3, y: 4, width: 1, height: 3 },
        { x: 1, y: 6, width: 3, height: 1 }
    ];

    const digits = [
        [0, 1, 2, 4, 5, 6],
        [1, 4],
        [0, 2, 3, 4, 6],
        [0, 2, 3, 5, 6],
        [1, 2, 3, 5],
        [0, 1, 3, 5, 6],
        [0, 1, 3, 4, 5, 6],
        [0, 2, 5],
        [0, 1, 2, 3, 4, 5, 6],
        [0, 1, 2, 3, 5, 6]
    ];

    const nodes = [];
    const digitsCount = start.toString().length;
    for (let i = 0; i < digitsCount; i++) {
        nodes.push([]);
    }

    for (let segment of segments) {
        for (let i = 0; i < digitsCount; i++) {
            let node = new Node();
            node.x = segment.x + i * 4;
            node.y = segment.y;
            node.width = segment.width;
            node.height = segment.height;
            node.type = "background";
            node.animation = {
                "offset": 0,
                "repeat": false,
                "tween_sequences": {
                    "position": {
                        "property": "position",
                        "total_duration": start/speed + 2,
                        "tweens": []
                    }
                }
            }
            nodes[i].push(node);
        }
    }

    for (let time = start; time >= 0; time--) {
        let timeString = time.toString().padStart(nodes.length, "-");
        for (let charIndex in timeString) {
            if (timeString[charIndex] === "-") {
                continue;
            }
            let digitIndex = parseInt(timeString[charIndex]);
            for (let segmentIndex in segments) {
                let node = nodes[charIndex][segmentIndex];
                if (digits[digitIndex].includes(parseInt(segmentIndex))) {
                    node.animation.tween_sequences.position.tweens.push({
                        "duration": 0,
                        "ease_type": 0,
                        "transition": 0,
                        "value_type": 5,
                        "value_x": 0,
                        "value_y": 0
                    });
                } else {
                    node.animation.tween_sequences.position.tweens.push({
                        "duration": 0,
                        "ease_type": 0,
                        "transition": 0,
                        "value_type": 5,
                        "value_x": 0,
                        "value_y": 10000
                    });
                }
                node.animation.tween_sequences.position.tweens.push({
                    "duration": 1/speed,
                    "ease_type": 0,
                    "transition": 0,
                    "value_type": 0
                });
            }
        }
    }

    for (let digit of nodes) {
        for (let node of digit) {
            node.animation.tween_sequences.position.tweens.push({
                "duration": 0,
                "ease_type": 0,
                "transition": 0,
                "value_type": 5,
                "value_x": 0,
                "value_y": 10000
            });
        }
    }

    const level = new Level();
    for (let digit of nodes) {
        for (let node of digit) {
            level.add(node);
        }
    }

    level.metadata.name = "Countdown";
    level.save();
}

function generateSignCountdown() {
    const start = parseInt(document.getElementById("sign-countdown-start").value);
    const speed = parseInt(document.getElementById("sign-countdown-speed").value);

    const interval = 1 / speed;

    const level = new Level();

    for (let i = start; i >= 0; i--) {
        const node = new Node();
        node.type = "sign";
        node.properties.message = i.toString();
        node.animation = {
            "offset": 0,
            "repeat": false,
            "tween_sequences": {
                "position": {
                    "property": "position",
                    "total_duration": start / speed + 2,
                    "tweens": [
                        {
                            "duration": 0,
                            "ease_type": 0,
                            "transition": 0,
                            "value_type": 5,
                            "value_x": 0,
                            "value_y": 10000
                        },
                        {
                            "duration": interval * (start - i),
                            "ease_type": 0,
                            "transition": 0,
                            "value_type": 0
                        },
                        {
                            "duration": 0,
                            "ease_type": 0,
                            "transition": 0,
                            "value_type": 5,
                            "value_x": 0,
                            "value_y": 0
                        },
                        {
                            "duration": interval,
                            "ease_type": 0,
                            "transition": 0,
                            "value_type": 0
                        },
                        {
                            "duration": 0,
                            "ease_type": 0,
                            "transition": 0,
                            "value_type": 5,
                            "value_x": 0,
                            "value_y": 10000
                        }
                    ]
                }
            }
        }
        level.add(node);
    }

    level.metadata.name = "Sign Countdown";
    level.save();
}

function getLevelDetails() {
    const file = document.getElementById("details-level").files[0];
    const output = document.getElementById("details-output");

    const reader = new FileReader();
    reader.onload = function() {
        let data = reader.result;
        let levelJSON = JSON.parse(data);
        const level = new Level(levelJSON);

        for (const key in level.metadata) {
            const element = document.getElementById(`details-${key}`);

            if (element) {
                element.innerText = level.metadata[key];
            }
        }

        const statistics = {
            "nodes": 0,
            "nodesByType": {},
            "animations": 0
        };

        for (const node of level.nodes) {
            statistics.nodes++;
            if (statistics.nodesByType[node.type]) {
                statistics.nodesByType[node.type]++;
            } else {
                statistics.nodesByType[node.type] = 1;
            }
            if (node.animation && Object.keys(node.animation).length !== 0) {
                statistics.animations++;
            }
        }

        document.getElementById("details-nodes").innerText = statistics.nodes + " objects";
        document.getElementById("details-animations").innerText = statistics.animations + " animation" + (statistics.animations == 1 ? "" : "s");
        document.getElementById("details-nodes-by-type").innerHTML = "";
        for (const type in statistics.nodesByType) {
            document.getElementById("details-nodes-by-type").innerHTML += "<span><span>" + type.replaceAll("_", " ") + "</span><span>" + statistics.nodesByType[type] + "</span></span> ";
        }

    }
    reader.readAsText(file);
}

//#region Statistics
const api_url = "https://goober-dash-stats-api.onrender.com";

const statsTab = document.getElementById("stats");
statsTab.addEventListener("click", loadStats);
let statsLoaded = false;

async function loadStats() {
    if (statsLoaded) return;
    statsLoaded = true;

    const leaderboards = ["wins", "records", "winstreak", "winrate", "games", "deaths"];

    const promises = [];
    for (const leaderboard of leaderboards) {
        promises.push(fetch(`${api_url}/${leaderboard}_leaderboard.json`));
    }
    const responses = await Promise.all(promises);

    const leaderboardsData = {};
    for (const [index, response] of responses.entries()) {
        const leaderboardData = await response.json();
        leaderboardsData[leaderboards[index]] = leaderboardData;
    }

    for (const leaderboard of leaderboards) {
        const container = document.getElementById(`${leaderboard}-lb`);
        container.innerHTML = "";
        for (const i in leaderboardsData[leaderboard]) {
            const entry = leaderboardsData[leaderboard][i];
            const rowElement = document.createElement("div");
            rowElement.classList.add("lb-row");

            const positionElement = document.createElement("span");
            positionElement.textContent = parseInt(i) + 1;
            const usernameElement = document.createElement("span");
            usernameElement.textContent = entry.username;
            const valueElement = document.createElement("span");
            let value = entry[leaderboard];
            if (leaderboard === "winrate") value = (value * 100).toFixed(1) + "%";
            valueElement.textContent = value;

            rowElement.appendChild(positionElement);
            rowElement.appendChild(usernameElement);
            rowElement.appendChild(valueElement);
            container.appendChild(rowElement);
        }

        const csvButton = document.getElementById(`${leaderboard}-csv`);
        csvButton.href = `data:text/csv;charset=utf-8,id,username,${leaderboard}\n${
            encodeURIComponent(leaderboardsData[leaderboard].map(
                entry => `${entry.id},${entry.username.replaceAll('\n', '')},${entry[leaderboard]}`
            ).join("\n"))
        }`;
        csvButton.download = `${leaderboard}_leaderboard.csv`;
    }
}

//#region runtime events

init();

document.getElementById("details-level").addEventListener("change", getLevelDetails);

document.getElementById("generate-grid").addEventListener("click", generateGrid);
document.getElementById("generate-pixel-art").addEventListener("click", generatePixelArt);
document.getElementById("generate-impossible-gravity").addEventListener("click", generateImpossibleGravity);
document.getElementById("modify-scale-level").addEventListener("click", modifyScaleLevel);
document.getElementById("modify-mirror-level").addEventListener("click", modifyMirrorLevel);
document.getElementById("modify-speed-level").addEventListener("click", modifySpeedLevel);
document.getElementById("modify-random-level").addEventListener("click", modifyRandomizeLevel);
document.getElementById("modify-gravity-level").addEventListener("click", modifyGravityLevel);
document.getElementById("modify-swap-level").addEventListener("click", modifySwapLevel);
document.getElementById("modify-separate-level").addEventListener("click", modifySeparateLevel);
document.getElementById("generate-text").addEventListener("click", generateBlockText);
document.getElementById("generate-countdown").addEventListener("click", generateCountdown);
document.getElementById("generate-sign-countdown").addEventListener("click", generateSignCountdown);
document.getElementById("generate-video").addEventListener("click", generateVideo);
document.getElementById("generate-circle").addEventListener("click", generateCircle);