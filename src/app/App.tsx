import { useEffect, useRef, useState } from 'react';

export default function App() {
  // Game constants
  const GRAVITY = 0.9;
  const JUMP_STRENGTH = -14;
  const MOVE_SPEED = 5;
  const PLAYER_SIZE = 40;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;
  const FLOOR_HEIGHT = 30;
  const COIN_SIZE = 30;
  const ENEMY_SIZE = 35;
  const MAP_WIDTH = 4000;
  const VICTORY_FLAG_X = 3400;
  const VICTORY_FLAG_WIDTH = 60;
  const VICTORY_FLAG_HEIGHT = 100;
  
  // Fixed level map - grid-based definition
  const LEVEL_MAP = [
    // Solid ground for first 500px
    { id: 'ground-1', type: 'ground', x: 0, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 500, height: FLOOR_HEIGHT },
    
    // GAP (500-700)
    
    // Platform 1
    { id: 'platform-1', type: 'platform', x: 700, y: 280, width: 150, height: 15 },
    
    // Ground segment
    { id: 'ground-2', type: 'ground', x: 700, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 200, height: FLOOR_HEIGHT },
    
    // GAP (900-1050)
    
    // Platform 2
    { id: 'platform-2', type: 'platform', x: 1050, y: 220, width: 140, height: 15 },
    
    // Ground segment
    { id: 'ground-3', type: 'ground', x: 1050, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 180, height: FLOOR_HEIGHT },
    
    // GAP (1230-1400)
    
    // Platform 3
    { id: 'platform-3', type: 'platform', x: 1400, y: 180, width: 130, height: 15 },
    
    // Ground segment
    { id: 'ground-4', type: 'ground', x: 1400, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 220, height: FLOOR_HEIGHT },
    
    // GAP (1620-1800)
    
    // Platform 4
    { id: 'platform-4', type: 'platform', x: 1800, y: 240, width: 120, height: 15 },
    
    // Ground segment
    { id: 'ground-5', type: 'ground', x: 1800, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 170, height: FLOOR_HEIGHT },
    
    // GAP (1970-2150)
    
    // Platform 5
    { id: 'platform-5', type: 'platform', x: 2150, y: 200, width: 150, height: 15 },
    
    // Ground segment
    { id: 'ground-6', type: 'ground', x: 2150, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 200, height: FLOOR_HEIGHT },
    
    // GAP (2350-2520)
    
    // Platform 6
    { id: 'platform-6', type: 'platform', x: 2520, y: 170, width: 130, height: 15 },
    
    // Ground segment
    { id: 'ground-7', type: 'ground', x: 2520, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 190, height: FLOOR_HEIGHT },
    
    // GAP (2710-2900)
    
    // Platform 7
    { id: 'platform-7', type: 'platform', x: 2900, y: 220, width: 140, height: 15 },
    
    // Ground segment
    { id: 'ground-8', type: 'ground', x: 2900, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 210, height: FLOOR_HEIGHT },
    
    // GAP (3110-3300)
    
    // Platform 8
    { id: 'platform-8', type: 'platform', x: 3300, y: 190, width: 120, height: 15 },
    
    // Ground segment
    { id: 'ground-9', type: 'ground', x: 3300, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 180, height: FLOOR_HEIGHT },
    
    // GAP (3480-3650)
    
    // Final platform and ground
    { id: 'platform-9', type: 'platform', x: 3650, y: 230, width: 150, height: 15 },
    { id: 'ground-10', type: 'ground', x: 3650, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 350, height: FLOOR_HEIGHT },
  ];
  
  const FIXED_COLLECTIBLES = [
    { id: 1, x: 250, y: 280 },
    { id: 2, x: 450, y: 290 },
    { id: 3, x: 750, y: 240 },
    { id: 4, x: 1100, y: 180 },
    { id: 5, x: 1450, y: 140 },
    { id: 6, x: 1850, y: 200 },
    { id: 7, x: 2200, y: 160 },
    { id: 8, x: 2570, y: 130 },
    { id: 9, x: 2950, y: 180 },
    { id: 10, x: 3350, y: 150 },
    { id: 11, x: 3700, y: 190 },
    { id: 12, x: 3850, y: 290 },
  ];
  
  const FIXED_ENEMIES = [
    { id: 1, x: 300, direction: 1, speed: 2, minX: 100, maxX: 450 },
    { id: 2, x: 1100, direction: -1, speed: 1.5, minX: 1050, maxX: 1200 },
    { id: 3, x: 1850, direction: 1, speed: 2, minX: 1800, maxX: 1950 },
    { id: 4, x: 2600, direction: -1, speed: 1.8, minX: 2520, maxX: 2680 },
    { id: 5, x: 3400, direction: 1, speed: 2, minX: 3300, maxX: 3460 },
  ];
  
  const [playerPos, setPlayerPos] = useState({ x: 100, y: 0 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [isGrounded, setIsGrounded] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [jumpsRemaining, setJumpsRemaining] = useState(2);
  const [worldOffset, setWorldOffset] = useState(0);
  const [distance, setDistance] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState<Set<number>>(new Set());
  const [victory, setVictory] = useState(false);
  const [victoryAnimPhase, setVictoryAnimPhase] = useState(0);
  
  // Enemy positions (these move, but don't generate/delete)
  const [enemies, setEnemies] = useState(
    FIXED_ENEMIES.map(e => {
      // Find ground under enemy
      const groundUnder = LEVEL_MAP.find(
        obj => obj.type === 'ground' && 
        e.x >= obj.x && 
        e.x <= obj.x + obj.width
      );
      const yPos = groundUnder ? groundUnder.y - ENEMY_SIZE : GAME_HEIGHT - FLOOR_HEIGHT - ENEMY_SIZE;
      return { ...e, y: yPos };
    })
  );
  
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const gameOverRef = useRef(false);
  const enemiesRef = useRef(enemies);
  const playerPosRef = useRef(playerPos);
  const playerVelocityRef = useRef(playerVelocity);
  const isGroundedRef = useRef(false);
  const jumpsRemainingRef = useRef(2);
  const worldOffsetRef = useRef(0);
  const collectedCoinsRef = useRef<Set<number>>(new Set());
  
  // Update refs when state changes
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  
  useEffect(() => {
    playerVelocityRef.current = playerVelocity;
  }, [playerVelocity]);
  
  useEffect(() => {
    isGroundedRef.current = isGrounded;
  }, [isGrounded]);
  
  useEffect(() => {
    jumpsRemainingRef.current = jumpsRemaining;
  }, [jumpsRemaining]);
  
  useEffect(() => {
    worldOffsetRef.current = worldOffset;
  }, [worldOffset]);
  
  useEffect(() => {
    collectedCoinsRef.current = collectedCoins;
  }, [collectedCoins]);
  
  // Play sound effect
  const playSound = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  };
  
  // Reset game
  const resetGame = () => {
    setPlayerPos({ x: 100, y: 0 });
    setPlayerVelocity({ x: 0, y: 0 });
    setScore(0);
    setDistance(0);
    setGameOver(false);
    gameOverRef.current = false;
    setJumpsRemaining(2);
    setWorldOffset(0);
    setCollectedCoins(new Set());
    setVictory(false);
    setVictoryAnimPhase(0);
    setEnemies(
      FIXED_ENEMIES.map(e => {
        const groundUnder = LEVEL_MAP.find(
          obj => obj.type === 'ground' && 
          e.x >= obj.x && 
          e.x <= obj.x + obj.width
        );
        const yPos = groundUnder ? groundUnder.y - ENEMY_SIZE : GAME_HEIGHT - FLOOR_HEIGHT - ENEMY_SIZE;
        return { ...e, y: yPos };
      })
    );
  };
  
  // Check collision with collectibles
  const checkCollectibleCollision = (worldX: number, worldY: number) => {
    const playerCenterX = worldX + PLAYER_SIZE / 2;
    const playerCenterY = worldY + PLAYER_SIZE / 2;
    
    FIXED_COLLECTIBLES.forEach(coin => {
      if (!collectedCoinsRef.current.has(coin.id)) {
        const coinCenterX = coin.x + COIN_SIZE / 2;
        const coinCenterY = coin.y + COIN_SIZE / 2;
        
        const distance = Math.sqrt(
          Math.pow(playerCenterX - coinCenterX, 2) + 
          Math.pow(playerCenterY - coinCenterY, 2)
        );
        
        if (distance < (PLAYER_SIZE / 2 + COIN_SIZE / 2)) {
          setCollectedCoins(prev => new Set([...prev, coin.id]));
          setScore(prev => prev + 1000);
          playSound(800, 0.2);
        }
      }
    });
  };
  
  // Check collision with enemies
  const checkEnemyCollision = (worldX: number, worldY: number, currentEnemies: typeof enemies) => {
    if (gameOverRef.current) return false;
    
    const playerLeft = worldX;
    const playerRight = worldX + PLAYER_SIZE;
    const playerTop = worldY;
    const playerBottom = worldY + PLAYER_SIZE;
    
    for (const enemy of currentEnemies) {
      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + ENEMY_SIZE;
      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + ENEMY_SIZE;
      
      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom > enemyTop &&
        playerTop < enemyBottom
      ) {
        gameOverRef.current = true;
        setGameOver(true);
        playSound(200, 0.5);
        setTimeout(() => {
          alert('Game Over: Market Crash! 📉\nYour Portfolio Value: ₹' + score + '\nDistance: ' + Math.floor(distance) + 'm');
          resetGame();
        }, 100);
        return true;
      }
    }
    return false;
  };
  
  // Check collision with any platform or ground
  const checkPlatformCollision = (worldX: number, worldY: number, velY: number) => {
    if (velY <= 0) return null;
    
    const playerBottom = worldY + PLAYER_SIZE;
    const playerLeft = worldX;
    const playerRight = worldX + PLAYER_SIZE;
    
    for (const obj of LEVEL_MAP) {
      const objTop = obj.y;
      const objBottom = obj.y + obj.height;
      const objLeft = obj.x;
      const objRight = obj.x + obj.width;
      
      if (
        playerBottom >= objTop &&
        playerBottom <= objBottom + 5 &&
        playerRight > objLeft &&
        playerLeft < objRight
      ) {
        return obj;
      }
    }
    return null;
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      const wasPressed = keysPressed.current[e.key];
      keysPressed.current[e.key] = true;
      
      // Jump - only on initial key press (not held)
      if ((e.key === 'ArrowUp' || e.key === ' ') && !wasPressed && !gameOver && jumpsRemainingRef.current > 0) {
        setPlayerVelocity(prev => ({ ...prev, y: JUMP_STRENGTH }));
        setJumpsRemaining(prev => prev - 1);
        playSound(400, 0.1);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver]);
  
  // Game loop
  useEffect(() => {
    if (gameOver) return;
    
    const gameLoop = () => {
      if (gameOverRef.current) {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
        return;
      }
      
      // Update enemies - only their positions, not creation/deletion
      const updatedEnemies = enemiesRef.current.map(enemy => {
        let newX = enemy.x + enemy.direction * enemy.speed;
        let newDirection = enemy.direction;
        
        if (newX <= enemy.minX || newX >= enemy.maxX) {
          newDirection = -enemy.direction;
          newX = enemy.x + newDirection * enemy.speed;
        }
        
        return { ...enemy, x: newX, direction: newDirection };
      });
      
      setEnemies(updatedEnemies);
      enemiesRef.current = updatedEnemies;
      
      // Update player
      let newVelX = 0;
      let newVelY = playerVelocityRef.current.y;
      
      // Horizontal movement
      if (keysPressed.current['ArrowLeft']) {
        newVelX = -MOVE_SPEED;
      } else if (keysPressed.current['ArrowRight']) {
        newVelX = MOVE_SPEED;
      }
      
      // Apply gravity
      newVelY += GRAVITY;
      
      // Calculate new position
      let newX = playerPosRef.current.x + newVelX;
      let newY = playerPosRef.current.y + newVelY;
      
      // Keep player centered, move camera instead
      const targetPlayerX = GAME_WIDTH / 3;
      if (newX > targetPlayerX) {
        const diff = newX - targetPlayerX;
        const newWorldOffset = Math.min(worldOffsetRef.current + diff, MAP_WIDTH - GAME_WIDTH);
        const actualDiff = newWorldOffset - worldOffsetRef.current;
        setWorldOffset(newWorldOffset);
        newX = playerPosRef.current.x + (diff - actualDiff);
        
        // Update distance traveled
        setDistance(prev => prev + actualDiff / 10);
      }
      
      // Don't let player go too far left
      newX = Math.max(50, newX);
      
      // Calculate world position for collision checks
      const worldX = newX + worldOffsetRef.current;
      const worldY = newY;
      
      // Check victory flag collision FIRST (before any other checks)
      if (!gameOverRef.current) {
        const playerRight = worldX + PLAYER_SIZE;
        const playerLeft = worldX;
        const playerBottom = worldY + PLAYER_SIZE;
        const playerTop = worldY;
        
        const flagLeft = VICTORY_FLAG_X;
        const flagRight = VICTORY_FLAG_X + VICTORY_FLAG_WIDTH;
        const flagTop = GAME_HEIGHT - FLOOR_HEIGHT - VICTORY_FLAG_HEIGHT;
        const flagBottom = GAME_HEIGHT - FLOOR_HEIGHT + 50; // Extended collision area
        
        // More lenient collision check - if player is anywhere near the flag
        if (
          playerRight > flagLeft &&
          playerLeft < flagRight &&
          worldX >= VICTORY_FLAG_X - 20 // Give extra buffer on the left
        ) {
          // Victory!
          gameOverRef.current = true;
          setVictory(true);
          playSound(600, 0.8);
          return;
        }
      }
      
      let grounded = false;
      
      // Check platform/ground collision
      const collidedPlatform = checkPlatformCollision(worldX, worldY, newVelY);
      if (collidedPlatform) {
        newY = collidedPlatform.y - PLAYER_SIZE;
        newVelY = 0;
        grounded = true;
      }
      
      // Check if player fell through the bottom (Death by Ditch) - AFTER victory check
      if (newY > GAME_HEIGHT) {
        gameOverRef.current = true;
        setGameOver(true);
        playSound(150, 0.7);
        
        // Show alert immediately
        alert('💥 Market Crash! You fell into a ditch!\n\nYour Portfolio Value: ₹' + score + '\nDistance: ' + Math.floor(distance) + 'm');
        
        // Reset after 2 seconds
        setTimeout(() => {
          resetGame();
        }, 2000);
        return;
      }
      
      // Reset jumps when grounded
      if (grounded && !isGroundedRef.current) {
        setJumpsRemaining(2);
      }
      
      setIsGrounded(grounded);
      
      // Check collectible collision
      if (!gameOverRef.current) {
        checkCollectibleCollision(worldX, newY);
      }
      
      // Check enemy collision
      if (!gameOverRef.current) {
        checkEnemyCollision(worldX, newY, updatedEnemies);
      }
      
      // Update position and velocity
      if (!gameOverRef.current) {
        setPlayerPos({ x: newX, y: newY });
        setPlayerVelocity({ x: newVelX, y: newVelY });
      }
      
      if (!gameOverRef.current) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver]);

  // Victory animation effect
  useEffect(() => {
    if (!victory) return;
    
    let animFrame = 0;
    let rafId: number;
    
    const animateVictory = () => {
      animFrame++;
      
      // Phase 1: Jump up (0-30 frames)
      if (animFrame <= 30) {
        setPlayerPos(prev => ({
          ...prev,
          y: Math.max(0, prev.y - 3)
        }));
        setVictoryAnimPhase(1);
        rafId = requestAnimationFrame(animateVictory);
      }
      // Phase 2: Fall back down (31-60 frames)
      else if (animFrame <= 60) {
        setPlayerPos(prev => ({
          ...prev,
          y: Math.min(GAME_HEIGHT - PLAYER_SIZE - FLOOR_HEIGHT, prev.y + 2)
        }));
        setVictoryAnimPhase(2);
        rafId = requestAnimationFrame(animateVictory);
      }
      // Phase 3: Celebration (done)
      else {
        setVictoryAnimPhase(3);
      }
    };
    
    rafId = requestAnimationFrame(animateVictory);
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [victory]);

  // Get only platforms for rendering
  const platforms = LEVEL_MAP.filter(obj => obj.type === 'platform');
  const groundSegments = LEVEL_MAP.filter(obj => obj.type === 'ground');

  return (
    <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#E5E7EB' }}>
      <div 
        className="relative overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, backgroundColor: '#F3F4F6' }}
      >
        {/* Office Background Layers */}
        
        {/* Background Wall - Light Office Wall */}
        <div 
          style={{
            position: 'absolute',
            left: -(worldOffset % 100),
            top: 0,
            width: MAP_WIDTH + 200,
            height: '100%',
            backgroundColor: '#F0F4F8',
          }}
        />
        
        {/* Brick Accent Wall Pattern */}
        <div 
          style={{
            position: 'absolute',
            left: -(worldOffset % 80),
            top: 0,
            width: MAP_WIDTH + 200,
            height: 60,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                #C4A57B 0px,
                #C4A57B 1px,
                transparent 1px,
                transparent 20px
              ),
              repeating-linear-gradient(
                90deg,
                #D4B896 0px,
                #D4B896 1px,
                transparent 1px,
                transparent 40px
              ),
              repeating-linear-gradient(
                90deg,
                #C4A57B 0px,
                #C4A57B 39px,
                #A08966 39px,
                #A08966 40px
              )
            `,
            backgroundColor: '#D4B896',
            borderBottom: '2px solid #A08966',
          }}
        />
        
        {/* Windows Pattern - Repeating Office Windows */}
        <div 
          style={{
            position: 'absolute',
            left: -(worldOffset % 300),
            top: 80,
            width: MAP_WIDTH + 600,
            height: 150,
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 40px,
                #87CEEB 40px,
                #87CEEB 140px,
                transparent 140px,
                transparent 180px,
                #87CEEB 180px,
                #87CEEB 280px,
                transparent 280px,
                transparent 300px
              )
            `,
            pointerEvents: 'none',
          }}
        >
          {/* Window frames */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i}>
              {/* Window 1 */}
              <div
                style={{
                  position: 'absolute',
                  left: i * 300 + 40,
                  top: 0,
                  width: 100,
                  height: 150,
                  border: '4px solid #4A5568',
                  backgroundColor: '#B8E6FF',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)',
                }}
              >
                {/* Window divider */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: 4,
                  height: '100%',
                  backgroundColor: '#4A5568',
                  transform: 'translateX(-50%)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  width: '100%',
                  height: 4,
                  backgroundColor: '#4A5568',
                  transform: 'translateY(-50%)',
                }} />
                
                {/* Cloud reflection */}
                <div style={{
                  position: 'absolute',
                  left: 10,
                  top: 20,
                  width: 30,
                  height: 15,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                }} />
              </div>
              
              {/* Window 2 */}
              <div
                style={{
                  position: 'absolute',
                  left: i * 300 + 180,
                  top: 0,
                  width: 100,
                  height: 150,
                  border: '4px solid #4A5568',
                  backgroundColor: '#B8E6FF',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)',
                }}
              >
                {/* Window divider */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: 4,
                  height: '100%',
                  backgroundColor: '#4A5568',
                  transform: 'translateX(-50%)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  width: '100%',
                  height: 4,
                  backgroundColor: '#4A5568',
                  transform: 'translateY(-50%)',
                }} />
                
                {/* Cloud reflection */}
                <div style={{
                  position: 'absolute',
                  left: 60,
                  top: 30,
                  width: 25,
                  height: 12,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Vertical Line Pattern (Wall Panels) */}
        <div 
          style={{
            position: 'absolute',
            left: -(worldOffset % 100),
            top: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 99px, rgba(0,0,0,0.05) 99px, rgba(0,0,0,0.05) 100px)',
            pointerEvents: 'none',
          }}
        />
        
        {/* World container that moves with camera */}
        <div 
          style={{
            position: 'absolute',
            left: -worldOffset,
            top: 0,
            width: '100%',
            height: '100%',
            transition: 'none',
          }}
        >
          {/* Company Logos Placed Throughout Office */}
          {[200, 800, 1400, 2000, 2600, 3200, 3700].map((xPos, idx) => (
            <div
              key={`logo-${idx}`}
              style={{
                position: 'absolute',
                left: xPos,
                top: 250,
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Groww Logo - Green Circle with G */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: '#00D09C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,208,156,0.3)',
                  border: '3px solid #00B886',
                }}
              >
                <span style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  G
                </span>
              </div>
            </div>
          ))}
          
          {/* Office Plants for Decoration */}
          {[350, 1200, 2100, 2800, 3500].map((xPos, idx) => (
            <div
              key={`plant-${idx}`}
              style={{
                position: 'absolute',
                left: xPos,
                top: GAME_HEIGHT - FLOOR_HEIGHT - 45,
                fontSize: '40px',
              }}
            >
              🪴
            </div>
          ))}
          
          {/* Ground Segments (Dark Office Carpet) */}
          {groundSegments.map((ground) => (
            <div
              key={ground.id}
              className="absolute"
              style={{ 
                left: ground.x,
                top: ground.y,
                width: ground.width,
                height: ground.height,
                background: 'linear-gradient(180deg, #374151 0%, #1F2937 100%)',
                boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.3)',
                borderTop: '2px solid #4B5563',
              }}
            >
              {/* Carpet texture pattern */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px)',
              }} />
            </div>
          ))}
          
          {/* Floating Platforms (Office Desks) */}
          {platforms.map((platform) => (
            <div key={platform.id}>
              {/* Desk surface */}
              <div
                className="absolute bg-white rounded-sm shadow-md"
                style={{
                  left: platform.x,
                  top: platform.y,
                  width: platform.width,
                  height: platform.height,
                }}
              />
              {/* Wooden legs */}
              <div
                className="absolute rounded-sm"
                style={{
                  left: platform.x + 10,
                  top: platform.y + platform.height,
                  width: 8,
                  height: 20,
                  backgroundColor: '#8B4513',
                }}
              />
              <div
                className="absolute rounded-sm"
                style={{
                  left: platform.x + platform.width - 18,
                  top: platform.y + platform.height,
                  width: 8,
                  height: 20,
                  backgroundColor: '#8B4513',
                }}
              />
            </div>
          ))}
          
          {/* Collectibles (SIP Gold Coins) */}
          {FIXED_COLLECTIBLES.map(coin => (
            !collectedCoins.has(coin.id) && (
              <div
                key={coin.id}
                className="absolute rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center shadow-lg"
                style={{
                  left: coin.x,
                  top: coin.y,
                  width: COIN_SIZE,
                  height: COIN_SIZE,
                }}
              >
                <span className="text-yellow-800 font-bold text-lg">₹</span>
              </div>
            )
          ))}
          
          {/* Enemies (Market Bears) */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className="absolute bg-red-600 rounded flex items-center justify-center shadow-lg"
              style={{
                left: enemy.x,
                top: enemy.y,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
              }}
            >
              <span className="text-white text-xl">📉</span>
            </div>
          ))}
          
          {/* Victory Flag at end of map */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: VICTORY_FLAG_X,
              top: GAME_HEIGHT - FLOOR_HEIGHT - VICTORY_FLAG_HEIGHT,
            }}
          >
            <div className="text-6xl">🏁</div>
            <div className="text-sm font-bold text-gray-700 bg-white/80 px-2 py-1 rounded mt-2">
              FINISH
            </div>
          </div>
        </div>
        
        {/* Player (Green Groww Mascot) - stays centered on screen */}
        <div
          className="absolute bg-green-500 rounded-lg flex items-center justify-center shadow-lg"
          style={{
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            left: playerPos.x,
            top: playerPos.y,
          }}
        >
          {/* Simple smile SVG */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            {/* Eyes */}
            <circle cx="10" cy="11" r="2" fill="white" />
            <circle cx="20" cy="11" r="2" fill="white" />
            {/* Smile */}
            <path
              d="M 8 17 Q 15 22 22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Fixed UI elements */}
        <div className="absolute top-4 left-4 text-gray-700 text-sm font-mono bg-white/80 px-3 py-2 rounded shadow-md">
          <div>← → Move</div>
          <div>↑ / Space: Jump (x2)</div>
          <div className="mt-1 text-xs text-green-600">Jumps: {'⬆️'.repeat(jumpsRemaining)}</div>
        </div>
        
        {/* Portfolio Value Score */}
        <div className="absolute top-4 right-4 text-gray-800 font-bold bg-white/90 px-4 py-3 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600">Portfolio Value</div>
          <div className="text-2xl text-green-600">₹{score.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Distance: {Math.floor(distance)}m</div>
        </div>
        
        {/* Victory Screen Overlay */}
        {victory && victoryAnimPhase >= 3 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                Level Complete!
              </h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                IPO Successful! 🚀
              </h2>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Final Portfolio Value</div>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ₹{score.toLocaleString()}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Distance Traveled</div>
                    <div className="font-bold text-gray-800">{Math.floor(distance)}m</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Coins Collected</div>
                    <div className="font-bold text-gray-800">{collectedCoins.size}/{FIXED_COLLECTIBLES.length}</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                🔄 Play Again
              </button>
              
              <div className="mt-4 text-xs text-gray-500">
                Congratulations on your successful IPO journey! 🏆
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}