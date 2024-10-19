import {GeometryCircle, GeometryLine, GeometrySpace, GeometryText} from "./geometry-logic.js";

const RADIUS = 100;

function get_margin(h) {
    return h / 10;
}

function _tree_to_space(tree) {
    if (tree == null) {
        return [new GeometrySpace(0, 0), null];
    }

    let [left, left_node] = _tree_to_space(tree.left);
    let [right, right_node] = _tree_to_space(tree.right);

    let side_margin = RADIUS * 2;
    if (left_node && right_node) {
        side_margin += get_margin(left.h + right.h);
    }
    let vertical_margin = Math.max(RADIUS * 3, get_margin(left.h + right.h));

    // Calculate space height to balance left and right subtrees under the root
    let totalHeight = left.h + vertical_margin + right.h;
    let totalWidth = side_margin + Math.max(left.w, right.w);
    let space = new GeometrySpace(totalWidth, totalHeight);

    // Project left and right subtree geometries with adjusted offsets for centering vertically
    let topOffset = (totalHeight - left.h - right.h) / 2;
    space.project(side_margin, topOffset, left);
    space.project(side_margin, topOffset + left.h + vertical_margin, right);

    // Create the root node
    let vertexY = topOffset + left.h + vertical_margin / 2;
    let vertex = new GeometryCircle(RADIUS, vertexY, RADIUS);
    space.insert(vertex);

    // Insert value and priority as text
    space.insert(new GeometryText(RADIUS, vertexY, tree.value, RADIUS * 2 / Math.max(2, tree.value.toString().length)));
    space.insert(new GeometryText(RADIUS, vertexY + 1.2 * RADIUS, tree.power, 50, "left"));

    // Draw lines from root to left and right nodes, if they exist
    if (left_node != null) {
        space.insert(new GeometryLine(RADIUS, vertexY, left_node.x, left_node.y, RADIUS));
    }
    if (right_node != null) {
        space.insert(new GeometryLine(RADIUS, vertexY, right_node.x, right_node.y, RADIUS));
    }

    return [space, vertex];
}

export function tree_to_space(tree, canvasWidth, canvasHeight) {
    let [space, root] = _tree_to_space(tree);

    // Scale the space to fit within the canvas
    let scaleX = canvasWidth / space.w;
    let scaleY = canvasHeight / space.h;
    let scale = Math.min(scaleX, scaleY) * 0.9; // Add padding (10%)

    for (let item of space.content) {
        item.x *= scale;
        item.y *= scale;
        if (item.g_type === "circle") {
            item.radius *= scale;
        } else if (item.g_type === "text") {
            item.size *= scale;
        }
    }

    let priorities = {"circle": 1, "line": 0, "text": 1};
    space.content.sort((a, b) => priorities[a.g_type] - priorities[b.g_type]);

    return [space, root];
}
