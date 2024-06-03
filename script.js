// script.js

class BDDNode {
    constructor(id, variable = null, low = null, high = null) {
        this.id = id;
        this.variable = variable;
        this.low = low;
        this.high = high;
    }
}

// キャンバス設定
const canvas = document.getElementById('bddCanvas');
const ctx = canvas.getContext('2d');

// ノード描画関数
function drawNode(node, x, y) {
    const radius = 20;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.variable || node.id, x, y);
}

// エッジ描画関数の修正
function drawEdge(node, child, x1, y1, x2, y2, color) {
    const radius = 20; // ノードの半径
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // ノードの境界に調整
    const x1Adjusted = x1 + radius * Math.cos(angle);
    const y1Adjusted = y1 + radius * Math.sin(angle);
    const x2Adjusted = x2 - radius * Math.cos(angle);
    const y2Adjusted = y2 - radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x1Adjusted, y1Adjusted);
    ctx.lineTo(x2Adjusted, y2Adjusted);
    ctx.strokeStyle = color;
    ctx.stroke();

    const headlen = 10; // 矢印の長さ
    ctx.beginPath();
    ctx.moveTo(x2Adjusted, y2Adjusted);
    ctx.lineTo(x2Adjusted - headlen * Math.cos(angle - Math.PI / 6), y2Adjusted - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2Adjusted - headlen * Math.cos(angle + Math.PI / 6), y2Adjusted - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// BDD全体を描画する関数
function drawBDD(nodes) {
    const levelHeight = 100;
    const rootX = canvas.width / 2;
    const rootY = 50;

    const nodePositions = {};
    let minX = Infinity;
    let maxX = -Infinity;

    const drawPositions = (node, x, y, level) => {
        if (!node || nodePositions[node.id]) return;
        nodePositions[node.id] = { x, y };

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        const offset = canvas.width / (2 ** (level + 1));
        drawPositions(node.low, x - offset, y + levelHeight, level + 1);
        drawPositions(node.high, x + offset, y + levelHeight, level + 1);
    };

    drawPositions(nodes[nodes.length - 1], rootX, rootY, 0);

    const canvasPadding = 50;
    const maxY = Math.max(...Object.values(nodePositions).map(pos => pos.y)) + canvasPadding;

    canvas.width = Math.max(canvas.width, maxX - minX + canvasPadding * 2);
    canvas.height = Math.max(canvas.height, maxY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - (maxX - minX)) / 2 - minX;

    for (const node of nodes) {
        if (node.variable) {
            const { x, y } = nodePositions[node.id];
            drawNode(node, x + offsetX, y);

            if (node.low) {
                const lowPos = nodePositions[node.low.id];
                drawEdge(node, node.low, x + offsetX, y, lowPos.x + offsetX, lowPos.y, 'red');
            }
            if (node.high) {
                const highPos = nodePositions[node.high.id];
                drawEdge(node, node.high, x + offsetX, y, highPos.x + offsetX, highPos.y, 'green');
            }
        } else {
            const { x, y } = nodePositions[node.id];
            drawNode(node, x + offsetX, y);
        }
    }
}

// フォームのイベントリスナー
document.getElementById('bddForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nodeStr = document.getElementById('nodes').value;
    const nodeArr = nodeStr.split(';').map(s => s.trim());
    const nodes = [];

    for (const str of nodeArr) {
        const [id, variable, low, high] = str.split(',').map(s => s.trim());
        nodes.push(new BDDNode(parseInt(id), variable || null, nodes[parseInt(low)] || null, nodes[parseInt(high)] || null));
    }

    drawBDD(nodes);
});

// 初期描画
const initialNodes = [
    new BDDNode(0), // 0ノード
    new BDDNode(1), // 1ノード
    new BDDNode(2, 'x1', 0, 1), // 変数x1のノード
    new BDDNode(3, 'x2', 2, 1)  // 変数x2のノード
];
drawBDD(initialNodes);
