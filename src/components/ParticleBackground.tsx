import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({
    x: undefined as number | undefined,
    y: undefined as number | undefined,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const numberOfParticles = 100;
    const connectDistance = 150;
    const mouseRadius = 130;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = event.x;
      mouse.current.y = event.y;
    };
    const handleMouseOut = () => {
      mouse.current.x = undefined;
      mouse.current.y = undefined;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1.5; // Slightly larger, more visible dots
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.x += this.speedX;
        this.y += this.speedY;

        if (mouse.current.x !== undefined && mouse.current.y !== undefined) {
          const dx = this.x - mouse.current.x;
          const dy = this.y - mouse.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseRadius - distance) / mouseRadius;
            this.x += forceDirectionX * force * 0.6;
            this.y += forceDirectionY * force * 0.6;
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = "rgba(250, 204, 21, 0.8)"; // Faded Yellow
        ctx.shadowColor = "rgba(250, 204, 21, 1)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            if (!ctx) continue;
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(
              particlesArray[a].x,
              particlesArray[a].y,
              particlesArray[b].x,
              particlesArray[b].y
            );
            gradient.addColorStop(0, "rgba(219, 39, 120, 0.89)"); // Pink
            gradient.addColorStop(1, "rgba(138, 92, 246, 1)"); // Purple
            ctx.strokeStyle = gradient;
            ctx.globalAlpha = 1 - distance / connectDistance;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    let animationFrameId: number;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particlesArray) {
        particle.update();
        particle.draw();
      }
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas"></canvas>;
};

export default ParticleBackground;
