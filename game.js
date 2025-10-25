 let canvas = document.getElementById("board");
    let ctx = canvas.getContext("2d");

    let player1 = 0;
    let player2 = 0;
    let currentPlayer = 1;
    let strikerStart = { x: 300, y: 550 };

    let striker = {
      x: strikerStart.x,
      y: strikerStart.y,
      r: 15,
      dx: 0,
      dy: 0,
      moving: false,
      angle: -Math.PI / 2,
      power: 8
    };

    // 🎱 Create Coins
    let coins = [];
    function createCoins() {
      for (let i = 0; i < 12; i++) {
        coins.push({
          x: 180 + Math.random() * 240,
          y: 180 + Math.random() * 240,
          r: 10,
          color: "black",
          type: "black",
          dx: 0,
          dy: 0
        });
      }
      for (let i = 0; i < 12; i++) {
        coins.push({
          x: 180 + Math.random() * 240,
          y: 180 + Math.random() * 240,
          r: 10,
          color: "white",
          type: "white",
          dx: 0,
          dy: 0
        });
      }
      coins.push({
        x: 300,
        y: 300,
        r: 12,
        color: "red",
        type: "queen",
        queen: true,
        dx: 0,
        dy: 0
      });
    }
    createCoins();

    let pockets = [
      { x: 30, y: 30, r: 25 },
      { x: 570, y: 30, r: 25 },
      { x: 30, y: 570, r: 25 },
      { x: 570, y: 570, r: 25 }
    ];

    function drawBoard() {
      ctx.clearRect(0, 0, 600, 600);
      ctx.fillStyle = "#f4d5a4";
      ctx.fillRect(0, 0, 600, 600);

      ctx.strokeStyle = "#5a3c2d";
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, 600, 600);

      ctx.strokeStyle = "#8b5a2b";
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 100, 400, 400);

      ctx.beginPath();
      ctx.arc(300, 300, 30, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "black";
      pockets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(striker.x, striker.y, striker.r, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(striker.x, striker.y);
      ctx.lineTo(
        striker.x + Math.cos(striker.angle) * 40,
        striker.y + Math.sin(striker.angle) * 40
      );
      ctx.strokeStyle = "red";
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(`Player ${currentPlayer}'s Turn`, 230, 20);
    }

    function detectCollision(a, b) {
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      return distance < a.r + b.r;
    }

    function resolveCollision(a, b) {
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return;
      let nx = dx / distance;
      let ny = dy / distance;
      let p = 2 * ((a.dx * nx + a.dy * ny) - (b.dx * nx + b.dy * ny)) / 2;
      a.dx -= p * nx;
      a.dy -= p * ny;
      b.dx += p * nx;
      b.dy += p * ny;
    }

    function update() {
      if (striker.moving) {
        striker.x += striker.dx;
        striker.y += striker.dy;

        if (striker.x < striker.r || striker.x > 600 - striker.r) striker.dx = -striker.dx;
        if (striker.y < striker.r || striker.y > 600 - striker.r) striker.dy = -striker.dy;

        coins.forEach((coin) => {
          if (detectCollision(striker, coin)) {
            let angle = Math.atan2(coin.y - striker.y, coin.x - striker.x);
            let speed = 6;
            coin.dx = Math.cos(angle) * speed;
            coin.dy = Math.sin(angle) * speed;
            striker.dx *= 0.7;
            striker.dy *= 0.7;
          }
        });

        if (Math.abs(striker.dx) < 0.2 && Math.abs(striker.dy) < 0.2) {
          striker.moving = false;
          striker.dx = 0;
          striker.dy = 0;
          striker.x = strikerStart.x;
          striker.y = strikerStart.y;
          switchPlayer();
        }
      }

      coins.forEach((c, i) => {
        c.x += c.dx;
        c.y += c.dy;
        c.dx *= 0.97;
        c.dy *= 0.97;

        if (c.x < c.r || c.x > 600 - c.r) c.dx = -c.dx;
        if (c.y < c.r || c.y > 600 - c.r) c.dy = -c.dy;

        pockets.forEach(p => {
          let pdx = c.x - p.x;
          let pdy = c.y - p.y;
          let pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < p.r) handlePocket(i, c);
        });
      });

      for (let i = 0; i < coins.length; i++) {
        for (let j = i + 1; j < coins.length; j++) {
          if (detectCollision(coins[i], coins[j])) resolveCollision(coins[i], coins[j]);
        }
      }

      drawBoard();
      requestAnimationFrame(update);
    }

    function handlePocket(index, coin) {
      let correctColor = currentPlayer === 1 ? "black" : "white";
      if (coin.type === correctColor || coin.type === "queen") {
        addScore(coin.queen ? 100 : 50);
      } else {
        addScore(-50);
        switchPlayer();
      }
      coins.splice(index, 1);
    }

    function addScore(points) {
      if (currentPlayer === 1) {
        player1 += points;
        document.getElementById("p1").innerText = player1;
      } else {
        player2 += points;
        document.getElementById("p2").innerText = player2;
      }
    }

    function switchPlayer() {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      striker.x = strikerStart.x;
      striker.y = strikerStart.y;
      if (coins.length === 0) {
        let winner = player1 > player2 ? "Player 1" : "Player 2";
        Swal.fire({
          title: `🏆 ${winner} Wins!`,
          text: `Scores → P1: ${player1}, P2: ${player2}`,
          icon: "success"
        });
      }
    }

    canvas.addEventListener("mousemove", (e) => {
      let rect = canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left;
      let my = e.clientY - rect.top;
      striker.angle = Math.atan2(my - striker.y, mx - striker.x);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && striker.x > 60) striker.x -= 20;
      if (e.key === "ArrowRight" && striker.x < 540) striker.x += 20;
      if (e.key === " ") {
        striker.moving = true;
        striker.dx = Math.cos(striker.angle) * striker.power;
        striker.dy = Math.sin(striker.angle) * striker.power;
      }
    });

    // 📱 Mobile Buttons Functionality
    document.getElementById("leftBtn").onclick = () => {
      if (!striker.moving && striker.x > 60) striker.x -= 20;
    };
    document.getElementById("rightBtn").onclick = () => {
      if (!striker.moving && striker.x < 540) striker.x += 20;
    };
    document.getElementById("hitBtn").onclick = () => {
      if (!striker.moving) {
        striker.moving = true;
        striker.dx = Math.cos(striker.angle) * striker.power;
        striker.dy = Math.sin(striker.angle) * striker.power;
      }
    };

    drawBoard();
    update();