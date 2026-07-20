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
    CAMERA
==================================================*/
const camera =
{
    x: 0,
    y: 0,
    vx: 0.04,
    vy: 0.015
};

/*==================================================
    CONFIGURATION
==================================================*/
const config =
{
    nodeCount: 10,
    maxConnectionDistance: 170,
    nodeRadius: 2.3,
    maxSpeed: 0.18,
    glowRadius: 10,
    mouseForce: 0.8,
    mouseSpeedBoost: 6.2
};

/*==================================================
    NEBULA CLASS
==================================================*/

class Nebula {

    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.radius = 250 + Math.random() * 450;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.001 + Math.random() * 0.002;
        this.driftX = (Math.random() - 0.5) * 0.03;
        this.driftY = (Math.random() - 0.5) * 0.03;
        this.color = Math.floor(Math.random() * 3);
    }

    update() {
        this.phase += this.speed;
        this.x += this.driftX;
        this.y += this.driftY;
        if (this.x < -this.radius)
            this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius)
            this.x = -this.radius;
        if (this.y < -this.radius)
            this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius)
            this.y = -this.radius;
    }

    draw() {
        const pulse = 0.65 + Math.sin(this.phase) * 0.15;
        let r, g, b;
        switch (this.color) {
            case 0:
                r = 40;
                g = 140;
                b = 255;
                break;
            case 1:
                r = 70;
                g = 220;
                b = 255;
                break;
            default:
                r = 90;
                g = 120;
                b = 255;
        }
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        //NEBULA COLOR AND OPACITY VALUES
        gradient.addColorStop(0, `rgba(${r},${g},${b},${0.1 * pulse})`);
        gradient.addColorStop(0.45, `rgba(${r},${g},${b},${0.018 * pulse})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2
        );
        ctx.fill();
    }
}


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
        this.depth = 0.5 + Math.random();
        this.radius = (config.nodeRadius + Math.random() * 1.4) * this.depth;

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
        let speed = config.maxSpeed * this.depth * (1 + mouseGlow * config.mouseSpeedBoost);
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
        //Camera Coordinates
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        //Calculate distances and mouseGlow
        // Distance to mouse.
        const mouseGlow = getMouseInfluence(drawX, drawY);
        const constellationGlow = this.constellationGlow || 0;
        const brightness = 220 + mouseGlow * 35 + constellationGlow * 35;

        // Node pulse.
        const pulse = (Math.sin(this.phase) + Math.sin(this.phase * 0.63)) * 0.25 + 0.5;
        const glowRadius = config.glowRadius + pulse * 3 + mouseGlow * 8 + constellationGlow * 10;
        const coreRadius = this.radius + pulse * 0.4;

        // Outer glow
        let gradient =
            ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowRadius);

        gradient.addColorStop(0, `rgba(180,235,255,${(0.25 + mouseGlow * 0.25) * this.brightness})`);
        gradient.addColorStop(1, "rgba(180,235,255,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        //Draw Constellation
        this.constellationGlow *= 0.95;
        if (this.constellationGlow < 0.01)
            this.constellationGlow = 0;

        // Inner glow
        gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowRadius * 0.45);
        gradient.addColorStop(0, `rgba(255,255,255,${0.20 * this.brightness})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgb(${brightness}, 252, 255)`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
    }

}


/*==================================================
    CREATE NETWORK
==================================================*/
const nodes = [];
const pulses = [];
const constellations = [];
const thoughts = [];
const packets = [];
const nebulae = [];

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
    CREATE NEBULA
==================================================*/
function createNebulae() {
    nebulae.length = 0;
    for (let i = 0; i < 8; i++)
        nebulae.push(new Nebula());
}

/*==================================================
    CREATE ENERGY PULSE
==================================================*/
function createPulse(startNode, endNode) {
    pulses.push(
        {
            start: startNode,
            end: endNode,
            progress: 0,
            speed: 0.004 + Math.random() * 0.006
        });
}

/*==================================================
    CREATE CONSTELLATION
==================================================*/
function createConstellation() {
    if (nodes.length == 0)
        return;

    const center = nodes[Math.floor(Math.random() * nodes.length)];
    const group = [];

    for (const node of nodes) {
        const dx = node.x - center.x;
        const dy = node.y - center.y;

        if (Math.sqrt(dx * dx + dy * dy) < 180)
            group.push(node);
    }

    if (group.length < 5)
        return;

    constellations.push(
        {
            nodes: group,
            age: 0,
            duration: 220 + Math.random() * 120
        });
}

/*==================================================
    CREATE THOUGHT
==================================================*/
function createThought() {
    if (nodes.length === 0)
        return;
    thoughts.push({
        frontier: [
            nodes[Math.floor(Math.random() * nodes.length)]
        ],
        visited: new Set(),
        timer: 0,
        interval: 10
    });
}

/*==================================================
    UPDATE THOUGHTS
==================================================*/
function updateThoughts() {
    for (let i = thoughts.length - 1; i >= 0; i--) {
        const thought = thoughts[i];
        thought.timer++;
        if (thought.timer < thought.interval)
            continue;
        thought.timer = 0;
        const next = [];
        for (const node of thought.frontier) {
            if (thought.visited.has(node))
                continue;
            thought.visited.add(node);
            node.constellationGlow = 2.4;
            for (const other of nodes) {

                if (other === node)
                    continue;

                const dx = node.x - other.x;
                const dy = node.y - other.y;
                if (Math.sqrt(dx * dx + dy * dy)
                    < config.maxConnectionDistance) {
                    createPulse(node, other);
                    if (Math.random() < 0.45)
                        next.push(other);
                }
            }
        }
        thought.frontier = next;
        if (next.length === 0)
            thoughts.splice(i, 1);
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

            if (distance < config.maxConnectionDistance) {
                const alpha = 1 - distance / config.maxConnectionDistance;
                const mx = (nodes[i].x + nodes[j].x) / 2;
                const my = (nodes[i].y + nodes[j].y) / 2;
                const mouseInfluence = getMouseInfluence(mx, my);
                const depth = (nodes[i].depth + nodes[j].depth) * 0.5;
                const opacity = alpha * depth * (0.28 + mouseInfluence * 0.45);
                const blue = 220 + mouseInfluence * 35;
                const green = 220 + mouseInfluence * 20;

                ctx.strokeStyle = `rgba(120,${green},${blue},${opacity})`;
                ctx.lineWidth = 0.15 + depth * 0.8 + alpha * 0.9 + mouseInfluence * 1.2;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x - camera.x, nodes[i].y - camera.y);
                ctx.lineTo(nodes[j].x - camera.x, nodes[j].y - camera.y);
                ctx.stroke();
                if (Math.random() < 0.00018) {
                    createPulse(nodes[i], nodes[j]);
                }
            }

            if (Math.random() < 0.00002 &&
                packets.length < 20) {
                packets.push(
                    new Packet(nodes[i], nodes[j])
                );
            }

        }
    }
}


/*==================================================
    DRAW ENERGY PULSES
==================================================*/
function drawPulses() {
    for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
            pulses.splice(i, 1);
            continue;
        }
        const worldX = pulse.start.x + (pulse.end.x - pulse.start.x) * pulse.progress;
        const worldY = pulse.start.y + (pulse.end.y - pulse.start.y) * pulse.progress;
        const x = worldX - camera.x;
        const y = worldY - camera.y;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, "rgba(255,255,255,.95)");
        glow.addColorStop(.35, "rgba(150,240,255,.8)");
        glow.addColorStop(1, "rgba(150,240,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

/*==================================================
    DRAW CONSTELLATIONS
==================================================*/
function drawConstellations() {
    for (let i = constellations.length - 1; i >= 0; i--) {
        const c = constellations[i];
        c.age++;
        if (c.age > c.duration) {
            constellations.splice(i, 1);
            continue;
        }
        const fade =
            Math.sin(
                c.age / c.duration * Math.PI
            );
        for (const node of c.nodes) {
            node.constellationGlow = Math.max(
                node.constellationGlow || 0,
                fade
            );
        }
    }
}

/*==================================================
    CAMERA UPDATE
==================================================*/
function updateCamera() {
    camera.x += camera.vx;
    camera.y += camera.vy;
}

/*==================================================
    ENERGY PACKETS
==================================================*/
class Packet {

    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.progress = 0;
        this.speed = 0.004 + Math.random() * 0.004;
        this.size = 1.5 + Math.random() * 1.5;
        this.life = 1;
    }

    update() {
        this.progress += this.speed;
        if (this.progress >= 1)
            this.life = 0;
    }

    draw() {
        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, this.size * 8);
        glow.addColorStop(0, "rgba(255,255,255,.95)");
        glow.addColorStop(.4, "rgba(170,240,255,.8)");
        glow.addColorStop(1, "rgba(170,240,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, this.size * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/*==================================================
    ANIMATION LOOP
==================================================*/
function animate() {
    updateCamera();
    /* Thoughts at random cycles */
    /*
    if (Math.random() < 0.002)
        createThought();
    */
    updateThoughts();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* Draw Nebula */
    for (const nebula of nebulae) {
        nebula.update();
        nebula.draw();
    }
    /* Draw Constellation */
    if (Math.random() < 0.004) {
        createConstellation();
    }
    drawConnections();
    //Energy Packets
    for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].update();
        packets[i].draw();

        if (packets[i].life <= 0)
            packets.splice(i, 1);
    }
    drawPulses();
    drawConstellations();

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

canvas.addEventListener("pointerleave", () => {
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
    createNebulae();
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