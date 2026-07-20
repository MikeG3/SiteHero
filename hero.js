/*==================================================
     DESIGN MAP
/*==================================================

    CANVAS SETUP

    CONFIGURATION

    NODE CLASS

    CREATE NETWORK
    
    DRAW FUNCTIONS
        DRAW CONNECTIONS

    UPDATE FUNCTIONS
    
    MOUSE INTERACTION

    RESIZE HANDLING

    ANIMATION LOOP

/*==================================================
/*==================================================

/*==================================================
    CANVAS SETUP
==================================================*/

// Get the canvas element from the HTML.
const canvas = document.getElementById("networkCanvas");

// Get the 2D drawing context.
const ctx = canvas.getContext("2d");

/*==================================================
    MOUSE
==================================================*/
const mouse =
{
    x: -1000,
    y: -1000,
    radius: 160
};

/*==================================================
    CONFIGURATION
==================================================*/
const config =
{
    nodeCount: 90,
    maxConnectionDistance: 170,
    nodeRadius: 2.3,
    maxSpeed: 0.18,
    glowRadius: 10,
    mouseForce: 0.5,
    mouseSpeedBoost: 6.2
};


/*==================================================
    NODE CLASS
==================================================*/
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Initial movement direction.
        this.vx = (Math.random() - 0.5) * config.maxSpeed;
        this.vy = (Math.random() - 0.5) * config.maxSpeed;

        // Every node gets a tiny size variation
        this.radius = config.nodeRadius + Math.random() * 1.4;

        this.phase = Math.random() * Math.PI * 2;
        this.direction = Math.random() * Math.PI * 2;
        this.turnSpeed = (Math.random() - 0.5) * 0.004;
        this.brightness = .8 + Math.random() * .2;
    }

    update() {
        //Calculate distances and mouseGlow
        // Distance to mouse.
        const mouseGlow = getMouseInfluence(this.x, this.y);
        this.phase += 0.012 + mouseGlow * 0.02;

        // Slowly rotate this vertex's direction.
        this.direction += this.turnSpeed;

        // -------------------------------------------------
        // Distance to mouse
        // -------------------------------------------------
        // Base drifting motion.
        let speed = config.maxSpeed * (1 + mouseGlow * config.mouseSpeedBoost);
        this.vx = Math.cos(this.direction) * speed;
        this.vy = Math.sin(this.direction) * speed;

        if (mouseGlow > 0) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.001) {
                this.x += dx / distance * mouseGlow * config.mouseForce;
                this.y += dy / distance * mouseGlow * config.mouseForce;
            }
        }

        // -------------------------------------------------
        // Move
        // -------------------------------------------------
        this.x += this.vx;
        this.y += this.vy;

        // -------------------------------------------------
        // Bounce
        // -------------------------------------------------
        if (this.x < 0 || this.x > canvas.width)
            this.direction = Math.PI - this.direction;

        if (this.y < 0 || this.y > canvas.height)
            this.direction = -this.direction;
    }

    draw() {

        //Calculate distances and mouseGlow
        // Distance to mouse.
        const mouseGlow = getMouseInfluence(this.x, this.y);

        const brightness = 220 + mouseGlow * 35;

        // Node pulse.
        const pulse = (Math.sin(this.phase) + Math.sin(this.phase * 0.63)) * 0.25 + 0.5;
        const glowRadius = config.glowRadius + pulse * 3 + mouseGlow * 8;
        const coreRadius = this.radius + pulse * 0.4;

        // Outer glow
        let gradient =
            ctx.createRadialGradient(
                this.x,
                this.y,
                0,
                this.x,
                this.y,
                glowRadius
            );

        gradient.addColorStop(0, `rgba(180,235,255,${(0.25 + mouseGlow * 0.25) * this.brightness})`);
        gradient.addColorStop(1, "rgba(180,235,255,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            glowRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Inner glow
        gradient =
            ctx.createRadialGradient(
                this.x,
                this.y,
                0,

                this.x,
                this.y,
                glowRadius * 0.45

            );

        gradient.addColorStop(0, `rgba(255,255,255,${0.20 * this.brightness})`);

        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            glowRadius * 0.45,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Core
        ctx.fillStyle = `rgb(${brightness}, 252, 255)`;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            coreRadius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

}


/*==================================================
    CREATE NETWORK
==================================================*/
const nodes = [];

function createNodes() {
    nodes.length = 0;

    // Create a balanced distribution.
    const columns = 10;
    const rows = 9;
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = column * cellWidth + Math.random() * cellWidth;
            const y = row * cellHeight + Math.random() * cellHeight;

            nodes.push(new Node(x, y));
        }
    }
}


/*==================================================
    DRAW CONNECTIONS
==================================================*/
function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <
                config.maxConnectionDistance) {
                const alpha = 1 - distance / config.maxConnectionDistance;
                const mx = (nodes[i].x + nodes[j].x) / 2;
                const my = (nodes[i].y + nodes[j].y) / 2;
                const mouseInfluence = getMouseInfluence(mx, my);
                const opacity = alpha * (0.35 + mouseInfluence * 0.45);
                const blue = 220 + mouseInfluence * 35;
                const green = 220 + mouseInfluence * 20;

                ctx.strokeStyle = `rgba(120,${green},${blue},${opacity})`;
                ctx.lineWidth = 0.2 + alpha * 1.2 + mouseInfluence * 1.4;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }
}


/*==================================================
    ANIMATION LOOP
==================================================*/
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawConnections();

    for (const node of nodes) {
        node.update();
        node.draw();
    }

    requestAnimationFrame(animate);
}

/*==================================================
    MOUSE EVENTS
==================================================*/
window.addEventListener("pointermove", event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener("pointermove", () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function getMouseInfluence(x, y) {
    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, 1 - distance / mouse.radius);
}


/*==================================================
    RESIZE HANDLING
==================================================*/
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createNodes();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/*==================================================
    INITIALIZE
==================================================*/

resizeCanvas();

animate();