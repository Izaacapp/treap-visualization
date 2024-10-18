function _tree_to_space(tree) {
    if (tree == null) {
        return [new GeometrySpace(0, 0), null];
    }

    let [left, left_node] = _tree_to_space(tree.left);
    let [right, right_node] = _tree_to_space(tree.right);

    let top_margin = RADIUS * 2;
    if (left_node && right_node) {
        top_margin += get_margin(left.w - left_node.x + 2 * RADIUS + right_node.x);
    }
    let center_margin = RADIUS * 3;

    // Calculate space width to balance left and right subtrees around the root
    let totalWidth = left.w + center_margin + right.w;
    let space = new GeometrySpace(totalWidth, top_margin + Math.max(left.h, right.h));

    // Project left and right subtree geometries with adjusted offsets for centering
    let leftOffset = (totalWidth / 2) - (left.w / 2);
    space.project(leftOffset, top_margin, left);
    space.project(leftOffset + left.w + center_margin, top_margin, right);

    // Create the root node
    let vertexX = leftOffset + left.w + RADIUS;
    let vertex = new GeometryCircle(vertexX, RADIUS, RADIUS);
    space.insert(vertex);

    // Insert value and priority as text
    space.insert(new GeometryText(vertexX, RADIUS, tree.value, RADIUS * 2 / Math.max(2, tree.value.toString().length)));
    space.insert(new GeometryText(vertexX + 1.2 * RADIUS, RADIUS, tree.power, 50, "left"));

    // Draw lines from root to left and right nodes, if they exist
    if (left_node != null) {
        space.insert(new GeometryLine(vertexX, RADIUS, left_node.x, left_node.y, RADIUS));
    }
    if (right_node != null) {
        space.insert(new GeometryLine(vertexX, RADIUS, right_node.x, right_node.y, RADIUS));
    }

    return [space, vertex];
}
