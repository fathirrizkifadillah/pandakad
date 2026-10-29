import type React from "react";
import { useEffect, useRef } from "react";

interface AmbientCanvasProps {
	className?: string;
}

interface Particle {
	x: number;
	y: number;
	baseX: number;
	baseY: number;
	vx: number;
	vy: number;
	radius: number;
	color: string;
	alpha: number;
	pulseSpeed: number;
	pulseOffset: number;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({
	className = "",
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Respect prefers-reduced-motion
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (mediaQuery.matches) {
			// Render a subtle static ambient radial gradient
			const w = canvas.offsetWidth;
			const h = canvas.offsetHeight;
			canvas.width = w;
			canvas.height = h;
			const gradient = ctx.createRadialGradient(
				w / 2,
				h / 2,
				0,
				w / 2,
				h / 2,
				Math.max(w, h) / 1.5,
			);
			gradient.addColorStop(0, "rgba(210, 174, 84, 0.12)");
			gradient.addColorStop(0.5, "rgba(117, 131, 74, 0.08)");
			gradient.addColorStop(1, "rgba(24, 32, 18, 0)");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, w, h);
			return;
		}

		let animationFrameId: number;
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		let width = canvas.width;
		let height = canvas.height;

		// Mouse state
		const mouse = {
			x: -9999,
			y: -9999,
			radius: 120, // interaction radius
			active: false,
		};

		// Color palette: Olive Green and Warm Gold with soft transparency
		const colors = [
			"rgba(210, 174, 84,", // UNPANDA Gold
			"rgba(117, 131, 74,", // UNPANDA Olive Green
			"rgba(163, 177, 138,", // UNPANDA Sage Green
			"rgba(246, 245, 239,", // UNPANDA Parchment
		];

		// Generate ambient floating particles
		const particleCount = Math.min(Math.floor((width * height) / 18000), 40);
		const particles: Particle[] = [];

		for (let i = 0; i < particleCount; i++) {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
			particles.push({
				x,
				y,
				baseX: x,
				baseY: y,
				vx: (Math.random() - 0.5) * 0.45,
				vy: (Math.random() - 0.5) * 0.45,
				radius: Math.random() * 2.5 + 1.2,
				color: colorPrefix,
				alpha: Math.random() * 0.35 + 0.15,
				pulseSpeed: Math.random() * 0.02 + 0.01,
				pulseOffset: Math.random() * Math.PI * 2,
			});
		}

		// Handle resize
		const handleResize = () => {
			if (!canvas) return;
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			width = canvas.width;
			height = canvas.height;
		};

		// Track mouse relative to canvas
		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
			mouse.active = true;
		};

		const handleMouseLeave = () => {
			mouse.active = false;
			mouse.x = -9999;
			mouse.y = -9999;
		};

		// Parent container mouse listener for wider interaction area
		const parent = canvas.parentElement;
		if (parent) {
			parent.addEventListener("mousemove", handleMouseMove, { passive: true });
			parent.addEventListener("mouseleave", handleMouseLeave, {
				passive: true,
			});
		}
		window.addEventListener("resize", handleResize, { passive: true });

		let time = 0;

		const render = () => {
			if (document.hidden) {
				animationFrameId = requestAnimationFrame(render);
				return;
			}

			time += 0.015;
			ctx.clearRect(0, 0, width, height);

			// Draw ambient glow at mouse position when hovering
			if (mouse.active && mouse.x > 0 && mouse.y > 0) {
				const cursorGlow = ctx.createRadialGradient(
					mouse.x,
					mouse.y,
					0,
					mouse.x,
					mouse.y,
					mouse.radius,
				);
				cursorGlow.addColorStop(0, "rgba(210, 174, 84, 0.12)");
				cursorGlow.addColorStop(0.5, "rgba(117, 131, 74, 0.06)");
				cursorGlow.addColorStop(1, "rgba(24, 32, 18, 0)");
				ctx.fillStyle = cursorGlow;
				ctx.beginPath();
				ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
				ctx.fill();
			}

			// Draw and update particles
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];

				// Ambient organic drift
				p.x += p.vx;
				p.y += p.vy;

				// Bounce off boundaries with soft wrapping
				if (p.x < -20) p.x = width + 20;
				if (p.x > width + 20) p.x = -20;
				if (p.y < -20) p.y = height + 20;
				if (p.y > height + 20) p.y = -20;

				// Cursor interactive reaction (fluid gentle displacement)
				if (mouse.active) {
					const dx = mouse.x - p.x;
					const dy = mouse.y - p.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < mouse.radius) {
						const force = (mouse.radius - distance) / mouse.radius;
						const angle = Math.atan2(dy, dx);
						// Push away smoothly
						p.x -= Math.cos(angle) * force * 2.5;
						p.y -= Math.sin(angle) * force * 2.5;
					}
				}

				// Pulsing opacity
				const dynamicAlpha =
					p.alpha + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.08;
				const clampedAlpha = Math.max(0.05, Math.min(0.65, dynamicAlpha));

				// Draw particle
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fillStyle = `${p.color} ${clampedAlpha})`;
				ctx.shadowBlur = 8;
				ctx.shadowColor = `${p.color} 0.5)`;
				ctx.fill();
				ctx.shadowBlur = 0; // reset
			}

			// Draw subtle connective links between very close particles
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 85) {
						const lineAlpha = (1 - dist / 85) * 0.12;
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.strokeStyle = `rgba(210, 174, 84, ${lineAlpha})`;
						ctx.lineWidth = 0.65;
						ctx.stroke();
					}
				}
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => {
			cancelAnimationFrame(animationFrameId);
			if (parent) {
				parent.removeEventListener("mousemove", handleMouseMove);
				parent.removeEventListener("mouseleave", handleMouseLeave);
			}
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className={`absolute inset-0 pointer-events-none z-25 w-full h-full ${className}`}
		/>
	);
};
