import { useAuth } from '@getmocha/users-service/react';
import { Navigate, Link } from 'react-router';
import { ArrowLeft, Skull, Ghost, Trophy, RotateCcw } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

interface Obstacle {
  x: number;
  type: 'tombstone' | 'skull' | 'crow' | 'witch' | 'werewolf' | 'ghoul';
  height: number;
}

const GAME_CONFIG = {
  gravity: 0.6,
  jumpForce: -12,
  gameSpeed: 4,
  obstacleFrequency: 0.015,
  levels: [
    { name: "Graveyard", minScore: 0, speed: 4, bgColor: "from-gray-900 to-black" },
    { name: "Haunted Forest", minScore: 100, speed: 6, bgColor: "from-green-900 to-black" },
    { name: "Nightmare Realm", minScore: 250, speed: 8, bgColor: "from-red-900 to-black" }
  ]
};

export default function Game() {
  const { user, isPending } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameStateRef = useRef<{ ghost: any; obstacles: Obstacle[]; score: number; }>({
    ghost: { x: 100, y: 200, velocity: 0, isJumping: false },
    obstacles: [],
    score: 0
  });
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  

  if (!isPending && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-12 h-12 text-blood-red" />
        </div>
      </div>
    );
  }

  const getCurrentLevel = () => {
    for (let i = GAME_CONFIG.levels.length - 1; i >= 0; i--) {
      if (gameStateRef.current.score >= GAME_CONFIG.levels[i].minScore) {
        return i;
      }
    }
    return 0;
  };

  const resetGame = () => {
    const initialGhost = {
      x: 100,
      y: 200,
      velocity: 0,
      isJumping: false
    };
    
    gameStateRef.current = {
      ghost: initialGhost,
      obstacles: [],
      score: 0
    };
    
    setScore(0);
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameStateRef.current.ghost = {
        ...gameStateRef.current.ghost,
        velocity: GAME_CONFIG.jumpForce,
        isJumping: true
      };
      
    }
  }, [gameState]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'menu' || gameState === 'gameOver') {
          startGame();
        } else if (gameState === 'playing') {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, jump]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      const currentLevel = getCurrentLevel();
      const levelConfig = GAME_CONFIG.levels[currentLevel];
      
      // Clear canvas
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 240, canvas.width, 60);

      // Draw ground details
      ctx.fillStyle = '#FF0000';
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, 240, 2, 5);
      }

      // Update ghost physics
      let currentGhost = gameStateRef.current.ghost;
      let newY = currentGhost.y + currentGhost.velocity;
      let newVelocity = currentGhost.velocity + GAME_CONFIG.gravity;
      let isJumping = currentGhost.isJumping;

      // Ground collision
      if (newY >= 200) {
        newY = 200;
        newVelocity = 0;
        isJumping = false;
      }

      currentGhost = {
        ...currentGhost,
        y: newY,
        velocity: newVelocity,
        isJumping
      };

      gameStateRef.current.ghost = currentGhost;

      // Draw ghost with transparency and floating effect
      const ghostX = currentGhost.x;
      const ghostY = currentGhost.y + Math.sin(Date.now() * 0.01) * 3; // Floating effect
      
      // Ghost body (translucent white with glow)
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#F5F5F5';
      ctx.beginPath();
      // Ghost rounded top and wavy bottom
      ctx.arc(ghostX + 20, ghostY + 15, 18, Math.PI, 2 * Math.PI);
      ctx.lineTo(ghostX + 38, ghostY + 35);
      // Wavy bottom edge
      ctx.lineTo(ghostX + 32, ghostY + 40);
      ctx.lineTo(ghostX + 28, ghostY + 35);
      ctx.lineTo(ghostX + 20, ghostY + 40);
      ctx.lineTo(ghostX + 12, ghostY + 35);
      ctx.lineTo(ghostX + 8, ghostY + 40);
      ctx.lineTo(ghostX + 2, ghostY + 35);
      ctx.closePath();
      ctx.fill();
      
      // Ghost glow effect
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ghostX + 20, ghostY + 20, 25, 0, 2 * Math.PI);
      ctx.fill();
      
      // Ghost eyes (glowing red)
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(ghostX + 13, ghostY + 18, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ghostX + 27, ghostY + 18, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Eye glow
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(ghostX + 13, ghostY + 18, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ghostX + 27, ghostY + 18, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Ghost mouth (small 'o' shape)
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ghostX + 20, ghostY + 28, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Ethereal trail effect
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#F5F5F5';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(ghostX - (i + 1) * 8, ghostY + 20 + Math.sin(Date.now() * 0.008 + i) * 2, 8 - i * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1.0; // Reset alpha

      // Update obstacles
      let currentObstacles = gameStateRef.current.obstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - levelConfig.speed
      })).filter(obstacle => obstacle.x > -50);

      // Add new obstacles
      if (Math.random() < GAME_CONFIG.obstacleFrequency * (1 + currentLevel * 0.5)) {
        const obstacleTypes: Obstacle['type'][] = ['tombstone', 'skull', 'crow', 'witch', 'werewolf', 'ghoul'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        const heightMap = {
          'crow': 150,
          'witch': 120,
          'werewolf': 100,
          'ghoul': 110,
          'tombstone': 40,
          'skull': 40
        };
        
        currentObstacles.push({
          x: canvas.width,
          type,
          height: heightMap[type]
        });
      }

      gameStateRef.current.obstacles = currentObstacles;

      // Draw obstacles (graves and tombstones)
      currentObstacles.forEach(obstacle => {
        switch (obstacle.type) {
          case 'tombstone':
            // Grave mound base
            ctx.fillStyle = '#2D2D2D';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 15, 240 - 5, 18, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Dirt texture on mound
            ctx.fillStyle = '#1A1A1A';
            for (let i = 0; i < 8; i++) {
              ctx.fillRect(obstacle.x + 5 + i * 3, 240 - 8 + Math.random() * 3, 2, 1);
            }
            
            // Main tombstone body (weathered stone)
            ctx.fillStyle = '#4A4A4A';
            ctx.fillRect(obstacle.x + 5, 240 - obstacle.height, 20, obstacle.height - 10);
            
            // Stone texture lines
            ctx.fillStyle = '#3A3A3A';
            ctx.fillRect(obstacle.x + 5, 240 - obstacle.height + 10, 20, 1);
            ctx.fillRect(obstacle.x + 5, 240 - obstacle.height + 20, 20, 1);
            
            // Tombstone top (worn rounded edge)
            ctx.fillStyle = '#555555';
            ctx.beginPath();
            ctx.arc(obstacle.x + 15, 240 - obstacle.height + 6, 10, Math.PI, 2 * Math.PI);
            ctx.fill();
            
            // Weathered cross carved into stone
            ctx.fillStyle = '#2A2A2A';
            ctx.fillRect(obstacle.x + 13, 240 - obstacle.height + 12, 4, 18);
            ctx.fillRect(obstacle.x + 8, 240 - obstacle.height + 18, 14, 4);
            
            // Cross highlight (worn stone)
            ctx.fillStyle = '#666666';
            ctx.fillRect(obstacle.x + 13, 240 - obstacle.height + 12, 1, 18);
            ctx.fillRect(obstacle.x + 8, 240 - obstacle.height + 18, 14, 1);
            
            // Moss and lichen growth
            ctx.fillStyle = '#2A4A2A';
            ctx.fillRect(obstacle.x + 5, 240 - 18, 8, 6);
            ctx.fillRect(obstacle.x + 18, 240 - 25, 6, 8);
            ctx.fillRect(obstacle.x + 3, 240 - obstacle.height + 15, 3, 10);
            
            // Cracks in stone
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(obstacle.x + 12, 240 - obstacle.height + 8, 1, 25);
            ctx.fillRect(obstacle.x + 8, 240 - obstacle.height + 22, 8, 1);
            
            // Small flowers at base
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(obstacle.x + 8, 240 - 8, 1, 3);
            ctx.fillRect(obstacle.x + 20, 240 - 6, 1, 2);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(obstacle.x + 8, 240 - 9, 1, 1);
            ctx.fillRect(obstacle.x + 20, 240 - 7, 1, 1);
            
            // Realistic shadow with gradient
            const gradient = ctx.createLinearGradient(obstacle.x + 25, 240 - obstacle.height, obstacle.x + 35, 240);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(obstacle.x + 25, 240 - obstacle.height/2, 10, obstacle.height/2);
            break;
            
          case 'skull':
            // Grave mound with scattered bones
            ctx.fillStyle = '#2D2D2D';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 15, 240 - 3, 20, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Small stones around grave
            ctx.fillStyle = '#555555';
            ctx.fillRect(obstacle.x + 3, 240 - 5, 3, 2);
            ctx.fillRect(obstacle.x + 25, 240 - 4, 2, 3);
            ctx.fillRect(obstacle.x + 8, 240 - 6, 2, 2);
            
            // Wooden grave marker post
            ctx.fillStyle = '#654321';
            ctx.fillRect(obstacle.x + 12, 240 - obstacle.height, 8, obstacle.height - 5);
            
            // Wood grain lines
            ctx.fillStyle = '#4A3018';
            ctx.fillRect(obstacle.x + 12, 240 - obstacle.height + 5, 8, 1);
            ctx.fillRect(obstacle.x + 12, 240 - obstacle.height + 15, 8, 1);
            ctx.fillRect(obstacle.x + 12, 240 - obstacle.height + 25, 8, 1);
            
            // Skull mounted on post (larger and more detailed)
            ctx.fillStyle = '#F5F5DC'; // Bone white
            ctx.beginPath();
            ctx.arc(obstacle.x + 16, 240 - obstacle.height + 15, 12, 0, 2 * Math.PI);
            ctx.fill();
            
            // Skull forehead ridge
            ctx.fillStyle = '#E8E8E8';
            ctx.beginPath();
            ctx.arc(obstacle.x + 16, 240 - obstacle.height + 12, 10, 0, Math.PI);
            ctx.fill();
            
            // Deep eye sockets with shadows
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(obstacle.x + 12, 240 - obstacle.height + 12, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(obstacle.x + 20, 240 - obstacle.height + 12, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye socket inner shadows
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(obstacle.x + 12, 240 - obstacle.height + 14, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(obstacle.x + 20, 240 - obstacle.height + 14, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Detailed nasal cavity
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 16, 240 - obstacle.height + 16);
            ctx.lineTo(obstacle.x + 14, 240 - obstacle.height + 22);
            ctx.lineTo(obstacle.x + 18, 240 - obstacle.height + 22);
            ctx.closePath();
            ctx.fill();
            
            // Teeth and jaw
            ctx.fillStyle = '#000000';
            ctx.fillRect(obstacle.x + 13, 240 - obstacle.height + 22, 6, 3);
            // Individual teeth
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(obstacle.x + 13, 240 - obstacle.height + 22, 1, 2);
            ctx.fillRect(obstacle.x + 15, 240 - obstacle.height + 22, 1, 3);
            ctx.fillRect(obstacle.x + 17, 240 - obstacle.height + 22, 1, 2);
            
            // Skull cracks
            ctx.fillStyle = '#CCCCCC';
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 10, 240 - obstacle.height + 8);
            ctx.lineTo(obstacle.x + 8, 240 - obstacle.height + 15);
            ctx.stroke();
            
            // Weathering on post
            ctx.fillStyle = '#3A2818';
            ctx.fillRect(obstacle.x + 11, 240 - 15, 2, 8);
            ctx.fillRect(obstacle.x + 19, 240 - 12, 2, 5);
            
            // Realistic shadow
            const gradient2 = ctx.createLinearGradient(obstacle.x + 20, 240 - obstacle.height, obstacle.x + 30, 240);
            gradient2.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            gradient2.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = gradient2;
            ctx.fillRect(obstacle.x + 20, 240 - obstacle.height/2, 10, obstacle.height/2);
            break;
            
          case 'crow':
            // Ornate grave monument base
            ctx.fillStyle = '#3A3A3A';
            ctx.fillRect(obstacle.x + 5, obstacle.height + 15, 20, 25);
            
            // Monument details and carved patterns
            ctx.fillStyle = '#2A2A2A';
            ctx.fillRect(obstacle.x + 7, obstacle.height + 17, 16, 2);
            ctx.fillRect(obstacle.x + 7, obstacle.height + 22, 16, 2);
            ctx.fillRect(obstacle.x + 7, obstacle.height + 27, 16, 2);
            
            // Stone texture
            ctx.fillStyle = '#4A4A4A';
            ctx.fillRect(obstacle.x + 5, obstacle.height + 15, 1, 25);
            ctx.fillRect(obstacle.x + 25, obstacle.height + 15, 1, 25);
            
            // Small ornamental urn on top
            ctx.fillStyle = '#555555';
            ctx.fillRect(obstacle.x + 12, obstacle.height + 10, 6, 8);
            ctx.fillRect(obstacle.x + 11, obstacle.height + 8, 8, 3);
            
            // Detailed crow (larger and more menacing)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 15, obstacle.height - 2, 10, 15, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Crow head (more angular)
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.arc(obstacle.x + 15, obstacle.height - 12, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Sharp beak
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 21, obstacle.height - 12);
            ctx.lineTo(obstacle.x + 28, obstacle.height - 10);
            ctx.lineTo(obstacle.x + 21, obstacle.height - 8);
            ctx.closePath();
            ctx.fill();
            
            // Beak highlight
            ctx.fillStyle = '#555555';
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 21, obstacle.height - 11);
            ctx.lineTo(obstacle.x + 25, obstacle.height - 10);
            ctx.lineTo(obstacle.x + 21, obstacle.height - 9);
            ctx.closePath();
            ctx.fill();
            
            // Detailed wings (spread slightly)
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 8, obstacle.height + 2, 5, 12, -0.4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 22, obstacle.height + 2, 5, 12, 0.4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Wing feather details
            ctx.fillStyle = '#333333';
            ctx.fillRect(obstacle.x + 6, obstacle.height + 5, 1, 8);
            ctx.fillRect(obstacle.x + 23, obstacle.height + 5, 1, 8);
            
            // Menacing red glowing eyes (larger)
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(obstacle.x + 12, obstacle.height - 13, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(obstacle.x + 18, obstacle.height - 13, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye glow effect
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(obstacle.x + 12, obstacle.height - 13, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(obstacle.x + 18, obstacle.height - 13, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Crow talons gripping the monument
            ctx.fillStyle = '#444444';
            ctx.fillRect(obstacle.x + 13, obstacle.height + 8, 1, 3);
            ctx.fillRect(obstacle.x + 15, obstacle.height + 8, 1, 3);
            ctx.fillRect(obstacle.x + 17, obstacle.height + 8, 1, 3);
            
            // Monument shadow
            const gradient3 = ctx.createLinearGradient(obstacle.x + 25, obstacle.height, obstacle.x + 35, 240);
            gradient3.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            gradient3.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = gradient3;
            ctx.fillRect(obstacle.x + 25, obstacle.height, 10, 240 - obstacle.height);
            break;
            
          case 'witch':
            // Witch silhouette on broomstick floating above ground
            const witchX = obstacle.x + 15;
            const witchY = obstacle.height;
            
            // Witch body (dark robes)
            ctx.fillStyle = '#1A0F1A'; // Dark purple
            ctx.beginPath();
            ctx.ellipse(witchX, witchY + 10, 8, 18, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Witch cloak (flowing behind)
            ctx.fillStyle = '#2D1B2D';
            ctx.beginPath();
            ctx.ellipse(witchX - 5, witchY + 15, 6, 12, -0.3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Witch head (pale green skin)
            ctx.fillStyle = '#8FBC8F';
            ctx.beginPath();
            ctx.arc(witchX, witchY - 5, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Witch hat (classic pointed)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(witchX - 8, witchY - 8);
            ctx.lineTo(witchX + 8, witchY - 8);
            ctx.lineTo(witchX, witchY - 25);
            ctx.closePath();
            ctx.fill();
            
            // Hat brim
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.ellipse(witchX, witchY - 8, 10, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Witch face details
            ctx.fillStyle = '#FF6600'; // Orange glow for eyes
            ctx.beginPath();
            ctx.arc(witchX - 2, witchY - 6, 1.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(witchX + 2, witchY - 6, 1.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye glow
            ctx.fillStyle = 'rgba(255, 102, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(witchX - 2, witchY - 6, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(witchX + 2, witchY - 6, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Long crooked nose
            ctx.fillStyle = '#7A9A7A';
            ctx.beginPath();
            ctx.moveTo(witchX, witchY - 3);
            ctx.lineTo(witchX + 3, witchY - 1);
            ctx.lineTo(witchX + 1, witchY + 1);
            ctx.closePath();
            ctx.fill();
            
            // Broomstick handle
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(witchX - 15, witchY + 20, 30, 3);
            
            // Broom bristles
            ctx.fillStyle = '#DAA520';
            for (let i = 0; i < 8; i++) {
              ctx.fillRect(witchX + 12 + i * 2, witchY + 18 + Math.random() * 4, 1, 8);
            }
            
            // Witch arms holding broom
            ctx.fillStyle = '#8FBC8F';
            ctx.fillRect(witchX - 3, witchY + 5, 2, 8);
            ctx.fillRect(witchX + 1, witchY + 5, 2, 8);
            
            // Magical sparkles around witch
            ctx.fillStyle = '#FFD700';
            for (let i = 0; i < 5; i++) {
              const sparkleX = witchX + (Math.random() - 0.5) * 40;
              const sparkleY = witchY + (Math.random() - 0.5) * 30;
              ctx.fillRect(sparkleX, sparkleY, 1, 1);
            }
            
            // Purple magical aura
            ctx.fillStyle = 'rgba(128, 0, 128, 0.2)';
            ctx.beginPath();
            ctx.arc(witchX, witchY, 25, 0, 2 * Math.PI);
            ctx.fill();
            break;
            
          case 'werewolf':
            // Werewolf howling at the moon
            const werewolfX = obstacle.x + 15;
            const werewolfY = 240 - obstacle.height;
            
            // Werewolf body (muscular and hunched)
            ctx.fillStyle = '#2F2F2F'; // Dark gray fur
            ctx.beginPath();
            ctx.ellipse(werewolfX, werewolfY + 25, 12, 20, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Werewolf chest (lighter fur)
            ctx.fillStyle = '#4A4A4A';
            ctx.beginPath();
            ctx.ellipse(werewolfX, werewolfY + 20, 8, 15, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Werewolf head (elongated snout)
            ctx.fillStyle = '#2F2F2F';
            ctx.beginPath();
            ctx.ellipse(werewolfX, werewolfY + 5, 8, 10, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Snout
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.ellipse(werewolfX + 6, werewolfY + 8, 4, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Nose
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(werewolfX + 9, werewolfY + 6, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Glowing yellow eyes
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(werewolfX - 2, werewolfY + 2, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(werewolfX + 2, werewolfY + 2, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye glow
            ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(werewolfX - 2, werewolfY + 2, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(werewolfX + 2, werewolfY + 2, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Pointed ears
            ctx.fillStyle = '#2F2F2F';
            ctx.beginPath();
            ctx.moveTo(werewolfX - 6, werewolfY - 2);
            ctx.lineTo(werewolfX - 10, werewolfY - 10);
            ctx.lineTo(werewolfX - 2, werewolfY - 5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(werewolfX + 6, werewolfY - 2);
            ctx.lineTo(werewolfX + 10, werewolfY - 10);
            ctx.lineTo(werewolfX + 2, werewolfY - 5);
            ctx.closePath();
            ctx.fill();
            
            // Sharp teeth
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(werewolfX + 4, werewolfY + 10, 1, 4);
            ctx.fillRect(werewolfX + 6, werewolfY + 10, 1, 4);
            ctx.fillRect(werewolfX + 8, werewolfY + 10, 1, 3);
            
            // Muscular arms
            ctx.fillStyle = '#2F2F2F';
            ctx.beginPath();
            ctx.ellipse(werewolfX - 10, werewolfY + 18, 4, 12, -0.3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(werewolfX + 10, werewolfY + 18, 4, 12, 0.3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Claws
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(werewolfX - 12, werewolfY + 25, 1, 3);
            ctx.fillRect(werewolfX - 10, werewolfY + 26, 1, 3);
            ctx.fillRect(werewolfX - 8, werewolfY + 25, 1, 3);
            ctx.fillRect(werewolfX + 12, werewolfY + 25, 1, 3);
            ctx.fillRect(werewolfX + 10, werewolfY + 26, 1, 3);
            ctx.fillRect(werewolfX + 8, werewolfY + 25, 1, 3);
            
            // Powerful legs
            ctx.fillStyle = '#2F2F2F';
            ctx.fillRect(werewolfX - 6, werewolfY + 35, 4, 15);
            ctx.fillRect(werewolfX + 2, werewolfY + 35, 4, 15);
            
            // Werewolf shadow
            const werewolfGradient = ctx.createLinearGradient(werewolfX + 12, werewolfY, werewolfX + 22, 240);
            werewolfGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
            werewolfGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = werewolfGradient;
            ctx.fillRect(werewolfX + 12, werewolfY, 10, 240 - werewolfY);
            break;
            
          case 'ghoul':
            // Ghoul emerging from the ground
            const ghoulX = obstacle.x + 15;
            const ghoulY = 240 - obstacle.height;
            
            // Ghoul torso (decaying and emaciated)
            ctx.fillStyle = '#556B2F'; // Sickly green
            ctx.beginPath();
            ctx.ellipse(ghoulX, ghoulY + 20, 10, 18, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Exposed ribs
            ctx.fillStyle = '#2F4F2F';
            for (let i = 0; i < 4; i++) {
              ctx.fillRect(ghoulX - 8, ghoulY + 10 + i * 4, 16, 1);
            }
            
            // Ghoul head (skull-like)
            ctx.fillStyle = '#6B8E23';
            ctx.beginPath();
            ctx.arc(ghoulX, ghoulY + 5, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Sunken cheeks
            ctx.fillStyle = '#556B2F';
            ctx.beginPath();
            ctx.arc(ghoulX - 5, ghoulY + 8, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ghoulX + 5, ghoulY + 8, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Hollow glowing eye sockets
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(ghoulX - 3, ghoulY + 2, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ghoulX + 3, ghoulY + 2, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Glowing eyes deep in sockets
            ctx.fillStyle = '#00FF00'; // Eerie green glow
            ctx.beginPath();
            ctx.arc(ghoulX - 3, ghoulY + 2, 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ghoulX + 3, ghoulY + 2, 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye glow effect
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(ghoulX - 3, ghoulY + 2, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ghoulX + 3, ghoulY + 2, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Gaping mouth with visible teeth
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(ghoulX, ghoulY + 12, 4, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Rotting teeth
            ctx.fillStyle = '#FFFFCC';
            ctx.fillRect(ghoulX - 3, ghoulY + 11, 1, 2);
            ctx.fillRect(ghoulX - 1, ghoulY + 11, 1, 3);
            ctx.fillRect(ghoulX + 1, ghoulY + 11, 1, 2);
            ctx.fillRect(ghoulX + 3, ghoulY + 11, 1, 2);
            
            // Tattered clothing
            ctx.fillStyle = '#2F2F2F';
            ctx.fillRect(ghoulX - 8, ghoulY + 15, 16, 8);
            
            // Rips in clothing
            ctx.fillStyle = '#556B2F';
            ctx.fillRect(ghoulX - 3, ghoulY + 16, 2, 6);
            ctx.fillRect(ghoulX + 4, ghoulY + 18, 3, 4);
            
            // Skeletal arms reaching out
            ctx.fillStyle = '#6B8E23';
            ctx.fillRect(ghoulX - 12, ghoulY + 18, 8, 3);
            ctx.fillRect(ghoulX + 4, ghoulY + 18, 8, 3);
            
            // Bony hands with long fingernails
            ctx.fillStyle = '#8FBC8F';
            ctx.beginPath();
            ctx.arc(ghoulX - 12, ghoulY + 20, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ghoulX + 12, ghoulY + 20, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Long black fingernails
            ctx.fillStyle = '#000000';
            ctx.fillRect(ghoulX - 15, ghoulY + 19, 2, 1);
            ctx.fillRect(ghoulX - 14, ghoulY + 21, 2, 1);
            ctx.fillRect(ghoulX - 13, ghoulY + 17, 2, 1);
            ctx.fillRect(ghoulX + 13, ghoulY + 19, 2, 1);
            ctx.fillRect(ghoulX + 14, ghoulY + 21, 2, 1);
            ctx.fillRect(ghoulX + 15, ghoulY + 17, 2, 1);
            
            // Dirt and debris around base (emerging from ground)
            ctx.fillStyle = '#3C2414';
            ctx.fillRect(ghoulX - 10, 240 - 8, 20, 8);
            
            // Small rocks and dirt clumps
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(ghoulX - 8, 240 - 5, 2, 2);
            ctx.fillRect(ghoulX + 6, 240 - 6, 3, 2);
            ctx.fillRect(ghoulX - 2, 240 - 4, 1, 2);
            
            // Ghoul shadow
            const ghoulGradient = ctx.createLinearGradient(ghoulX + 8, ghoulY, ghoulX + 18, 240);
            ghoulGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            ghoulGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = ghoulGradient;
            ctx.fillRect(ghoulX + 8, ghoulY, 10, 240 - ghoulY);
            break;
        }
      });

      // Check collisions
      const ghostHitbox = {
        x: currentGhost.x,
        y: currentGhost.y,
        width: 40,
        height: 40
      };

      for (const obstacle of currentObstacles) {
        const isFloating = obstacle.type === 'crow' || obstacle.type === 'witch';
        const obstacleHitbox = {
          x: obstacle.x,
          y: isFloating ? obstacle.height : 240 - obstacle.height,
          width: 30,
          height: isFloating ? 20 : obstacle.height
        };

        if (
          ghostHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
          ghostHitbox.x + ghostHitbox.width > obstacleHitbox.x &&
          ghostHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
          ghostHitbox.y + ghostHitbox.height > obstacleHitbox.y
        ) {
          setGameState('gameOver');
          if (gameStateRef.current.score > highScore) {
            setHighScore(gameStateRef.current.score);
          }
          return;
        }
      }

      // Update score
      gameStateRef.current.score += 1;

      // Update React state periodically
      if (gameStateRef.current.score % 10 === 0) {
        setScore(gameStateRef.current.score);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    };
  }, [gameState, highScore]);

  const currentLevel = getCurrentLevel();
  const levelConfig = GAME_CONFIG.levels[currentLevel];

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background gradient based on level */}
      <div className={`absolute inset-0 bg-gradient-to-b ${levelConfig.bgColor} opacity-50`}></div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-16 w-3 h-3 bg-blood-red rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-pale-white rounded-full opacity-40 flicker"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-blood-red rounded-full opacity-30 animate-bounce"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="flex items-center space-x-2 bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-2 px-4 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Realm</span>
          </Link>
          
          <div className="text-center">
            <h1 className="font-creepster text-2xl md:text-3xl text-pale-white animate-pulse">
              Spirit Runner
            </h1>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Game Container */}
        <div className="max-w-4xl mx-auto">
          {/* Game Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 rounded-lg px-4 py-2">
              <span className="text-pale-white text-sm">Score: {gameState === 'playing' ? gameStateRef.current.score : score}</span>
            </div>
            <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 rounded-lg px-4 py-2">
              <span className="text-pale-white text-sm">Level: {levelConfig.name}</span>
            </div>
            <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 rounded-lg px-4 py-2">
              <span className="text-pale-white text-sm">High: {highScore}</span>
            </div>
          </div>

          {/* Game Canvas Container */}
          <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-4 mb-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-auto max-w-full border border-blood-red/20 rounded cursor-pointer"
              onClick={gameState === 'playing' ? jump : startGame}
            />
          </div>

          {/* Game States */}
          {gameState === 'menu' && (
            <div className="text-center">
              <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-8">
                <Ghost className="w-16 h-16 text-pale-white mx-auto mb-4 animate-bounce" />
                <h2 className="font-creepster text-3xl text-pale-white mb-4">
                  Spirit Runner
                </h2>
                <p className="text-pale-white/80 mb-6">
                  Guide the ghost through the haunted realm. Jump over obstacles to survive!
                </p>
                <div className="space-y-2 mb-6 text-sm text-pale-white/60">
                  <p>• Press SPACE or UP ARROW to jump</p>
                  <p>• Avoid tombstones, skulls, crows, witches, werewolves, and ghouls</p>
                  <p>• Survive to unlock harder levels</p>
                </div>
                <button
                  onClick={startGame}
                  className="bg-dark-gray hover:bg-blood-red text-pale-white font-bold py-3 px-8 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30"
                >
                  <span className="flex items-center space-x-2">
                    <Ghost className="w-5 h-5" />
                    <span>Begin Haunting</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center">
              <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-8">
                <Skull className="w-16 h-16 text-blood-red mx-auto mb-4 animate-pulse" />
                <h2 className="font-creepster text-3xl text-blood-red mb-4">
                  Game Over
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-gray rounded-lg p-4">
                    <div className="text-pale-white text-2xl font-bold">{score}</div>
                    <div className="text-pale-white/60 text-sm">Final Score</div>
                  </div>
                  <div className="bg-dark-gray rounded-lg p-4">
                    <div className="text-pale-white text-2xl font-bold">{levelConfig.name}</div>
                    <div className="text-pale-white/60 text-sm">Level Reached</div>
                  </div>
                  <div className="bg-dark-gray rounded-lg p-4">
                    <div className="text-yellow-400 text-2xl font-bold flex items-center justify-center">
                      <Trophy className="w-6 h-6 mr-1" />
                      {highScore}
                    </div>
                    <div className="text-pale-white/60 text-sm">High Score</div>
                  </div>
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={startGame}
                    className="bg-dark-gray hover:bg-blood-red text-pale-white font-bold py-3 px-6 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center mt-6">
            <p className="text-pale-white/40 text-sm font-nosifer">
              "Run, ghost, run... the darkness is catching up"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
