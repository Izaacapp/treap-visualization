import {random_tree_with_n_nodes, tree_by_keys_and_values, delete_node} from "./decart-logic.js";
import {tree_to_space} from "./transform-logic.js";
import {GeometrySpace} from "./geometry-logic.js";

const SPEED_FACTOR = 2.4;
const DEBUG = false;

const applyButton = document.getElementById("set-user-data");
const randomButton = document.getElementById("set-random");
const deleteButton = document.getElementById("delete-node");
const userData = document.getElementById("user-data");
const canvas = document.getElementById("canvas");

const increaseButton = document.getElementById("increase-size");
const decreaseButton = document.getElementById("decrease-size");

const closePopup = document.getElementById("close-popup");
const showPopup = document.getElementById("show-popup");
const popup = document.getElementById("rules-popup");

const ctx = canvas.getContext("2d");

let canvasRect = canvas.getBoundingClientRect();
canvas.width = canvasRect.width * 2;
canvas.height = canvasRect.height * 2;

let currentTree = random_tree_with_n_nodes(10); // Track current tree globally

// Helper function to calculate the width of a subtree (used for centering nodes)
function calculateSubtreeWidth(node) {
    if (!node || !node.children || node.children.length === 0) {
        return 1; // Base width for leaf nodes
    }
    return node.children.reduce((total, child) => total + calculateSubtreeWidth(child), 0);
}

// Recursive function to position nodes, ensuring balanced heights
function positionNodesBalanced(node, depth = 0, xOffset = 0) {
    const nodeSpacingX = 200;
    const nodeSpacingY = 150;

    // Calculate total width of left and right subtrees for balancing
    const subtreeWidth = calculateSubtreeWidth(node);

    node.x = xOffset + (subtreeWidth / 2) * nodeSpacingX;
    node.y = depth * nodeSpacingY;

    if (node.children) {
        let childXOffset = xOffset;
        node.children.forEach((child) => {
            const childSubtreeWidth = calculateSubtreeWidth(child);
            positionNodesBalanced(child, depth + 1, childXOffset);
            childXOffset += childSubtreeWidth * nodeSpacingX;
        });
    }
}

// Function to dynamically draw connections between parent and child nodes
function drawConnections(parent, children) {
    if (!children || children.length === 0) return;

    // For each child, draw a line from parent to child
    children.forEach((child) => {
        if (child) {
            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y);
            ctx.lineTo(child.x, child.y);
            ctx.stroke();

            // Recursively draw connections for the child's children
            drawConnections(child, child.children || []);
        }
    });
}

function draw_everything(thick_mode = false) {
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.lineWidth = thick_mode ? 100 : 15;

    // Traverse the tree and draw the connections dynamically
    if (space.root && space.root.children) {
        drawConnections(space.root, space.root.children);
    }

    for (let thing of space.content) {
        if (thing.g_type === "circle") {
            ctx.beginPath();
            ctx.arc(thing.x, thing.y, thing.radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (thing.g_type === "text") {
            ctx.textAlign = thing.align;
            ctx.textBaseline = thing.baseline;
            ctx.font = `${thing.size}px monospace`;
            ctx.fillText(thing.text, thing.x, thing.y);
        }
    }

    if (DEBUG) {
        ctx.beginPath();
        ctx.moveTo(1000, 0);
        ctx.lineTo(-1000, 0);
        ctx.moveTo(0, 1000);
        ctx.lineTo(0, -1000);
        ctx.stroke();
    }
}

function update(forced = false) {
    const changed = mouse.update();
    if (changed || forced) {
        panZoom.apply();
        draw_everything(panZoom.scale < 0.2);
    }
    requestAnimationFrame(update);
}

requestAnimationFrame(() => update(true));

function setTree(tree) {
    let [_space, root] = tree_to_space(tree);
    space = _space;
    currentTree = tree;

    // Position nodes using balanced positioning
    positionNodesBalanced(root);
    panZoom.resetToFit(space); // Ensure the tree fits the canvas width
}

function setRandomTree() {
    let n = parseInt(prompt("Enter number of nodes: ", "30"));
    setTree(random_tree_with_n_nodes(n));
}

function setUserTree() {
    try {
        let dat = userData.value
            .split("\n")
            .filter((x) => x)
            .map((line) => {
                let nums = line
                    .split(" ")
                    .filter((x) => x)
                    .map(Number);
                if (nums.length >= 3) {
                    throw Error("Too many numbers in line(max 2): " + line);
                }
                return nums;
            });

        setTree(tree_by_keys_and_values(dat));
    } catch (e) {
        alert(e);
    }
}

function deleteNodeFromTree() {
    let valueToDelete = parseInt(prompt("Enter value to delete:"));
    if (isNaN(valueToDelete)) {
        alert("Invalid value entered.");
        return;
    }
    currentTree = delete_node(currentTree, valueToDelete);
    setTree(currentTree);
}

function setPopupVisibility(x) {
    popup.style.display = x ? "grid" : "none";
}

function increaseSize() {
    panZoom.scaleAt(canvas.width / 2, canvas.height / 2, 1.1);
    panZoom.apply();
}

function decreaseSize() {
    panZoom.scaleAt(canvas.width / 2, canvas.height / 2, 0.9);
    panZoom.apply();
}

setTree(currentTree);

canvas.addEventListener("mousedown", mouse.handle_mouse_down);
canvas.addEventListener("mouseup", mouse.handle_mouse_up);
canvas.addEventListener("mousemove", mouse.handle_mouse_move);
canvas.addEventListener("wheel", mouse.handle_mouse_wheel);
canvas.addEventListener("mouseout", mouse.handle_mouse_out);
canvas.addEventListener("touchmove", mouse.handle_touch_move);
canvas.addEventListener("touchstart", mouse.handle_touch_down);
canvas.addEventListener("touchend", mouse.handle_touch_up);
applyButton.addEventListener("click", setUserTree);
randomButton.addEventListener("click", setRandomTree);
deleteButton.addEventListener("click", deleteNodeFromTree);

increaseButton.addEventListener("click", increaseSize);
document.addEventListener("keypress", (event) => {
    if (event.key === "=") increaseSize();
});

decreaseButton.addEventListener("click", decreaseSize);
document.addEventListener("keypress", (event) => {
    if (event.key === "-") decreaseSize();
});

showPopup.addEventListener("click", () => setPopupVisibility(true));
closePopup.addEventListener("click", () => setPopupVisibility(false));
