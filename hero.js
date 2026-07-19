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
    CONFIGURATION
==================================================*/
const config =
{
    nodeCount: 90,
    maxConnectionDistance: 170,
    nodeRadius: 2.3,
    maxSpeed: 0.18,
    glowRadius: 10
};


/*==================================================
    NODE CLASS
==================================================*/
class Node
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;

        // Random drifting direction
        this.vx = (Math.random() - 0.5) * config.maxSpeed;
        this.vy = (Math.random() - 0.5) * config.maxSpeed;

        // Every node gets a tiny size variation
        this.radius = config.nodeRadius + Math.random() * 1.2;
    }


    update()
    {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off screen edges

        if(this.x < 0 || this.x > canvas.width)
            this.vx *= -1;

        if(this.y < 0 || this.y > canvas.height)
            this.vy *= -1;
    }


    draw()
    {
        // Soft glow
        const gradient =
            ctx.createRadialGradient(
                this.x,
                this.y,
                0,
                this.x,
                this.y,
                config.glowRadius
            );

        gradient.addColorStop(
            0,
            "rgba(180,235,255,.9)"
        );

        gradient.addColorStop(
            1,
            "rgba(180,235,255,0)"
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            config.glowRadius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Core node
        ctx.fillStyle = "#C8F5FF";
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
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

function createNodes()
{
    nodes.length = 0;

    // Create a balanced distribution.
    const columns = 10;
    const rows = 9;
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    for(let row = 0; row < rows; row++)
    {
        for(let column = 0; column < columns; column++)
        {
            const x = column * cellWidth + Math.random() * cellWidth;
            const y = row * cellHeight + Math.random() * cellHeight;

            nodes.push( new Node(x, y) );
        }
    }
}


/*==================================================
    DRAW CONNECTIONS
==================================================*/
function drawConnections()
{
    for(let i = 0; i < nodes.length; i++)
    {
        for(let j = i + 1; j < nodes.length; j++)
        {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if(distance <
                config.maxConnectionDistance)
            {
                const alpha = 1 - distance / config.maxConnectionDistance;

                ctx.strokeStyle = `rgba(120,210,255,${alpha * .35})`;

                ctx.lineWidth = 1;

                ctx.beginPath();

                ctx.moveTo(
                    nodes[i].x,
                    nodes[i].y
                );

                ctx.lineTo(
                    nodes[j].x,
                    nodes[j].y
                );

                ctx.stroke();
            }
        }
    }
}


/*==================================================
    ANIMATION LOOP
==================================================*/

function animate()
{
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawConnections();

    for(const node of nodes)
    {
        node.update();
        node.draw();
    }

    requestAnimationFrame(animate);
}


/*==================================================
    RESIZE HANDLING
==================================================*/

function resizeCanvas()
{
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