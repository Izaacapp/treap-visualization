import {GeometryCircle, GeometryLine, GeometrySpace, GeometryText} from "./geometry-logic.js";

const RADIUS = 100;

function get_margin(w) {
    return w / 10;
}

function _tree_to_space(tree) {
    if (tree == null) {
        return [new GeometrySpace(0, 0), null];
    }

    let [left, left_node] = _tree_to_space(tree.left);
    let [right, right_node] = _tree_to_space(tree.right);

    let vertical_margin = RADIUS * 3; // Increase margin vertically to prioritize downward growth
    let center_margin = RADIUS * 2; // Reduce horizontal margin to avoid excessive widening

    let space = new GeometrySpace(
        Math.max(left.w, right.w) + center_margin, // Width is the max of left and right subtrees plus some margin
        left.h + vertical_margin + right.h // Height grows by adding both subtrees' heights and margin
    );

    space.project((space.w - left.w) / 2, 0, left); // Center left subtree horizontally
    space.project((space.w - right.w) / 2, left.h + vertical_margin, right); // Position right subtree below left

    let vertex = new GeometryCircle(space.w / 2, RADIUS, RADIUS); // Place root node in the center

    space.insert(vertex);

    space.insert(new GeometryText(space.w / 2, RADIUS, tree.value, RADIUS * 2 / Math.max(2, tree.value.toString().length)));
    space.insert(new GeometryText(space.w / 2 + 1.2 * RADIUS, RADIUS, tree.power, 50, "left"));

    if (left_node != null) {
        space.insert(new GeometryLine(vertex.x, vertex.y, left_node.x, left_node.y, RADIUS));
    }

    if (right_node != null) {
        space.insert(new GeometryLine(vertex.x, vertex.y, right_node.x, right_node.y, RADIUS));
    }

    return [space, vertex];
}

export function tree_to_space(tree) {
    let [space, root] = _tree_to_space(tree);

    let priorities = {"circle": 1, "line": 0, "text": 1};
    space.content.sort((a, b) => priorities[a.g_type] - priorities[b.g_type]);

    return [space, root];
}
