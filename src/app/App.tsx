import { useEffect, useRef, useState } from 'react';

export default function App() {
  // Game constants
  const GRAVITY = 0.9;
  const JUMP_STRENGTH = -14;
  const MOVE_SPEED = 5;
  const PLAYER_SIZE = 50;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;
  const FLOOR_HEIGHT = 30;
  const COIN_SIZE = 30;
  const ENEMY_SIZE = 50;
  const ENEMY_HIT_COOLDOWN = 120;
  const MAP_WIDTH = 4000;

  const GOAL_OPTIONS = [
    { id: 'airplane', label: 'Airplane', target: 1000000 },
    { id: 'phone', label: 'Phone', target: 10000 },
    { id: 'car', label: 'Car', target: 50000 },
    { id: 'house', label: 'House', target: 100000 },
  ];
  
  // Fixed level map - grid-based definition
  const LEVEL_MAP = [
    // Solid ground for first 500px
    { id: 'ground-1', type: 'ground', x: 0, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 500, height: FLOOR_HEIGHT },
    
    // GAP (500-700)
    
    // Platform 1
    { id: 'platform-1', type: 'platform', x: 700, y: 280, width: 150, height: 24 },
    
    // Ground segment
    { id: 'ground-2', type: 'ground', x: 700, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 200, height: FLOOR_HEIGHT },
    
    // GAP (900-1050)
    
    // Platform 2
    { id: 'platform-2', type: 'platform', x: 1050, y: 220, width: 140, height: 24 },
    
    // Ground segment
    { id: 'ground-3', type: 'ground', x: 1050, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 180, height: FLOOR_HEIGHT },
    
    // GAP (1230-1400)
    
    // Platform 3
    { id: 'platform-3', type: 'platform', x: 1400, y: 180, width: 130, height: 24 },
    
    // Ground segment
    { id: 'ground-4', type: 'ground', x: 1400, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 220, height: FLOOR_HEIGHT },
    
    // GAP (1620-1800)
    
    // Platform 4
    { id: 'platform-4', type: 'platform', x: 1800, y: 240, width: 120, height: 24 },
    
    // Ground segment
    { id: 'ground-5', type: 'ground', x: 1800, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 170, height: FLOOR_HEIGHT },
    
    // GAP (1970-2150)
    
    // Platform 5
    { id: 'platform-5', type: 'platform', x: 2150, y: 200, width: 150, height: 24 },
    
    // Ground segment
    { id: 'ground-6', type: 'ground', x: 2150, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 200, height: FLOOR_HEIGHT },
    
    // GAP (2350-2520)
    
    // Platform 6
    { id: 'platform-6', type: 'platform', x: 2520, y: 170, width: 130, height: 24 },
    
    // Ground segment
    { id: 'ground-7', type: 'ground', x: 2520, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 190, height: FLOOR_HEIGHT },
    
    // GAP (2710-2900)
    
    // Platform 7
    { id: 'platform-7', type: 'platform', x: 2900, y: 220, width: 140, height: 24 },
    
    // Ground segment
    { id: 'ground-8', type: 'ground', x: 2900, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 210, height: FLOOR_HEIGHT },
    
    // GAP (3110-3300)
    
    // Platform 8
    { id: 'platform-8', type: 'platform', x: 3300, y: 190, width: 120, height: 24 },
    
    // Ground segment
    { id: 'ground-9', type: 'ground', x: 3300, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 180, height: FLOOR_HEIGHT },
    
    // GAP (3480-3650)
    
    // Final platform and ground
    { id: 'platform-9', type: 'platform', x: 3650, y: 230, width: 150, height: 24 },
    { id: 'ground-10', type: 'ground', x: 3650, y: GAME_HEIGHT - FLOOR_HEIGHT, width: 350, height: FLOOR_HEIGHT },
  ];
  
  const STOCK_LOGOS = [
    { src: '/assets/logos/ADANIGREEN.png', name: 'ADANIGREEN', value: 1800 },
    { src: '/assets/logos/SWIGGY.png', name: 'SWIGGY', value: 4200 },
    { src: '/assets/logos/JIOFIN.png', name: 'JIOFIN', value: 3500 },
    { src: '/assets/logos/HINDUNILVR.png', name: 'HINDUNILVR', value: 7600 },
    { src: '/assets/logos/PNB.png', name: 'PNB', value: 1200 },
    { src: '/assets/logos/GODREJPROP.png', name: 'GODREJPROP', value: 5800 },
    { src: '/assets/logos/IOC.png', name: 'IOC', value: 2400 },
    { src: '/assets/logos/SBILIFE.png', name: 'SBILIFE', value: 9500 },
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
  
  const [gameStarted, setGameStarted] = useState(false);
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
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [targetScore, setTargetScore] = useState(0);
  const [goalName, setGoalName] = useState('');
  
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
  const enemyHitCooldownRef = useRef(0);
  const scoreRef = useRef(0);
  const targetScoreRef = useRef(0);
  
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

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    targetScoreRef.current = targetScore;
  }, [targetScore]);
  
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
  
  const startWithGoal = (goal: typeof GOAL_OPTIONS[number]) => {
    setTargetScore(goal.target);
    targetScoreRef.current = goal.target;
    setGoalName(goal.label);
    setScore(0);
    scoreRef.current = 0;
    setGameStarted(true);
    setPlayerPos({ x: 100, y: 0 });
    setPlayerVelocity({ x: 0, y: 0 });
    setDistance(0);
    setGameOver(false);
    gameOverRef.current = false;
    enemyHitCooldownRef.current = 0;
    setJumpsRemaining(2);
    setWorldOffset(0);
    worldOffsetRef.current = 0;
    setCollectedCoins(new Set());
    collectedCoinsRef.current = new Set();
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

  // Reset game — goes back to goal selection
  const resetGame = (showStart = false) => {
    setGameStarted(!showStart);
    setPlayerPos({ x: 100, y: 0 });
    setPlayerVelocity({ x: 0, y: 0 });
    setScore(0);
    scoreRef.current = 0;
    setDistance(0);
    setGameOver(false);
    gameOverRef.current = false;
    enemyHitCooldownRef.current = 0;
    setJumpsRemaining(2);
    setWorldOffset(0);
    worldOffsetRef.current = 0;
    setCollectedCoins(new Set());
    collectedCoinsRef.current = new Set();
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
          const stock = STOCK_LOGOS[(coin.id - 1) % STOCK_LOGOS.length];
          setCollectedCoins(prev => new Set([...prev, coin.id]));
          const newScore = scoreRef.current + stock.value;
          scoreRef.current = newScore;
          setScore(newScore);
          playSound(800, 0.2);
          if (targetScoreRef.current > 0 && newScore >= targetScoreRef.current) {
            gameOverRef.current = true;
            setVictory(true);
            playSound(600, 0.8);
          }
        }
      }
    });
  };
  
  // Check collision with enemies — halves portfolio on hit
  const checkEnemyCollision = (worldX: number, worldY: number, currentEnemies: typeof enemies) => {
    if (gameOverRef.current) return false;
    if (enemyHitCooldownRef.current > 0) {
      enemyHitCooldownRef.current--;
      return false;
    }
    
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
        const halvedScore = Math.floor(scoreRef.current / 2);
        scoreRef.current = halvedScore;
        setScore(halvedScore);
        enemyHitCooldownRef.current = ENEMY_HIT_COOLDOWN;
        playSound(200, 0.3);
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
    if (!gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      const wasPressed = keysPressed.current[e.key];
      keysPressed.current[e.key] = true;
      setActiveKeys(prev => new Set([...prev, e.key]));
      
      // Jump - only on initial key press (not held)
      if ((e.key === 'ArrowUp' || e.key === ' ') && !wasPressed && !gameOver && jumpsRemainingRef.current > 0) {
        setPlayerVelocity(prev => ({ ...prev, y: JUMP_STRENGTH }));
        setJumpsRemaining(prev => prev - 1);
        playSound(400, 0.1);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      setActiveKeys(prev => { const next = new Set(prev); next.delete(e.key); return next; });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gameStarted]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
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
        let newWorldOffset = worldOffsetRef.current + diff;
        
        // Loop the level when reaching the end
        if (newWorldOffset >= MAP_WIDTH - GAME_WIDTH) {
          newWorldOffset = 0;
          worldOffsetRef.current = 0;
          newX = 100;
          setCollectedCoins(new Set());
          collectedCoinsRef.current = new Set();
        } else {
          const actualDiff = newWorldOffset - worldOffsetRef.current;
          newX = playerPosRef.current.x + (diff - actualDiff);
          setDistance(prev => prev + actualDiff / 10);
        }
        
        setWorldOffset(newWorldOffset);
        worldOffsetRef.current = newWorldOffset;
      }
      
      // Don't let player go too far left
      newX = Math.max(50, newX);
      
      // Calculate world position for collision checks
      const worldX = newX + worldOffsetRef.current;
      const worldY = newY;
      
      // Victory is checked immediately when collecting a stock in checkCollectibleCollision
      
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
  }, [gameOver, gameStarted]);

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
        {/* Parallax Background — single layer, tiled horizontally */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/assets/background.png)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            backgroundPositionX: -(worldOffset * 0.4),
            backgroundPositionY: 0,
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
          {/* Ground Segments */}
          {groundSegments.map((ground) => (
            <div
              key={ground.id}
              className="absolute"
              style={{ 
                left: ground.x,
                top: ground.y,
                width: ground.width,
                height: ground.height,
                backgroundImage: 'url(/assets/platform.png)',
                backgroundRepeat: 'repeat-x',
                backgroundSize: `auto ${ground.height}px`,
                backgroundPosition: 'left top',
              }}
            />
          ))}
          
          {/* Floating Platforms */}
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="absolute"
              style={{
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
                backgroundImage: 'url(/assets/air-platform.png)',
                backgroundRepeat: 'repeat-x',
                backgroundSize: `auto ${platform.height}px`,
                backgroundPosition: 'left top',
              }}
            />
          ))}
          
          {/* Collectibles (Stock Logos) */}
          {FIXED_COLLECTIBLES.map(coin => {
            const stock = STOCK_LOGOS[(coin.id - 1) % STOCK_LOGOS.length];
            return !collectedCoins.has(coin.id) && (
              <div
                key={coin.id}
                className="absolute"
                style={{
                  left: coin.x,
                  top: coin.y,
                  width: COIN_SIZE,
                  height: COIN_SIZE,
                }}
              >
                <img
                  src={stock.src}
                  alt={stock.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#16a34a',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  textShadow: '0 0 3px rgba(0,0,0,0.6)',
                }}>
                  ₹{stock.value.toLocaleString()}
                </div>
              </div>
            );
          })}
          
          {/* Enemies (Market Bears) */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className="absolute"
              style={{
                left: enemy.x,
                top: enemy.y,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
              }}
            >
              <img
                src="/assets/bear.png"
                alt="Bear"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  transform: enemy.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)',
                }}
              />
            </div>
          ))}
          
        </div>
        
        {/* Player - Hero Character */}
        <div
          className="absolute"
          style={{
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            left: playerPos.x,
            top: playerPos.y,
            opacity: enemyHitCooldownRef.current > 0 ? (Math.floor(enemyHitCooldownRef.current / 8) % 2 === 0 ? 0.3 : 1) : 1,
          }}
        >
          <img
            src="/assets/player.png"
            alt="Player"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              transform: keysPressed.current['ArrowLeft'] ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />
        </div>
        
        {/* Arrow Key Controls */}
        <div
          className="absolute"
          style={{ top: 12, left: 12, pointerEvents: 'none' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* Up arrow */}
            <img
              src="/assets/arrow-up.png"
              alt="Up"
              style={{
                width: 36,
                height: 36,
                imageRendering: 'pixelated',
                transform: activeKeys.has('ArrowUp') || activeKeys.has(' ') ? 'scale(0.78)' : 'scale(1)',
                transition: 'transform 0.08s ease-out',
              }}
            />
            {/* Left, Down, Right row */}
            <div style={{ display: 'flex', gap: 2 }}>
              <img
                src="/assets/arrow-left.png"
                alt="Left"
                style={{
                  width: 36,
                  height: 36,
                  imageRendering: 'pixelated',
                  transform: activeKeys.has('ArrowLeft') ? 'scale(0.78)' : 'scale(1)',
                  transition: 'transform 0.08s ease-out',
                }}
              />
              <img
                src="/assets/arrow-down.png"
                alt="Down"
                style={{
                  width: 36,
                  height: 36,
                  imageRendering: 'pixelated',
                  transform: activeKeys.has('ArrowDown') ? 'scale(0.78)' : 'scale(1)',
                  transition: 'transform 0.08s ease-out',
                }}
              />
              <img
                src="/assets/arrow-right.png"
                alt="Right"
                style={{
                  width: 36,
                  height: 36,
                  imageRendering: 'pixelated',
                  transform: activeKeys.has('ArrowRight') ? 'scale(0.78)' : 'scale(1)',
                  transition: 'transform 0.08s ease-out',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Portfolio Value Score */}
        <div className="absolute top-4 right-4 text-gray-800 font-bold bg-white/90 px-4 py-3 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600">Portfolio Value</div>
          <div className="text-2xl text-green-600">₹{score.toLocaleString()}</div>
          {targetScore > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Goal: ₹{targetScore.toLocaleString()} ({goalName})
            </div>
          )}
          <div style={{
            marginTop: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#e5e7eb',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (score / targetScore) * 100)}%`,
              backgroundColor: '#16a34a',
              borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
        
        {/* Start Screen — Goal Selection */}
        {!gameStarted && (
          <div
            className="absolute inset-0"
            style={{ zIndex: 50 }}
          >
            <img
              src="/assets/start-frame.png"
              alt="Select Goal"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated',
              }}
            />
            {/* Clickable option areas positioned over the image */}
            {/* Top-left: Airplane */}
            <button
              onClick={() => startWithGoal(GOAL_OPTIONS[0])}
              style={{
                position: 'absolute',
                left: '6%',
                top: '40%',
                width: '38%',
                height: '22%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            />
            {/* Top-right: Phone */}
            <button
              onClick={() => startWithGoal(GOAL_OPTIONS[1])}
              style={{
                position: 'absolute',
                right: '6%',
                top: '40%',
                width: '38%',
                height: '22%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            />
            {/* Bottom-left: Car */}
            <button
              onClick={() => startWithGoal(GOAL_OPTIONS[2])}
              style={{
                position: 'absolute',
                left: '6%',
                top: '68%',
                width: '38%',
                height: '22%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            />
            {/* Bottom-right: House */}
            <button
              onClick={() => startWithGoal(GOAL_OPTIONS[3])}
              style={{
                position: 'absolute',
                right: '6%',
                top: '68%',
                width: '38%',
                height: '22%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            />
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && !victory && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 50 }}
          >
            <div
              style={{
                background: '#111',
                border: '3px solid #00D09C',
                borderRadius: 20,
                padding: '36px 32px 28px',
                width: 340,
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(0, 208, 156, 0.15)',
              }}
            >
              {/* GAME OVER title */}
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#00D09C',
                  letterSpacing: 4,
                  imageRendering: 'pixelated',
                  marginBottom: 28,
                  textShadow: '0 0 20px rgba(0, 208, 156, 0.4)',
                }}
              >
                GAME OVER
              </div>

              {/* Holdings card */}
              <div
                style={{
                  background: '#1E1E1E',
                  borderRadius: 40,
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                {/* Diamond icon */}
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4L30 16L18 32L6 16L18 4Z" fill="#6C7BFF" />
                  <path d="M18 4L30 16L18 20L6 16L18 4Z" fill="#8B9AFF" />
                  <path d="M18 4L24 10L18 16L12 10L18 4Z" fill="#AAB8FF" opacity="0.7" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: '#888',
                      letterSpacing: 2,
                      marginBottom: 2,
                    }}
                  >
                    HOLDINGS
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#FFF',
                    }}
                  >
                    ₹{score.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Retry button */}
              <button
                onClick={() => resetGame(true)}
                style={{
                  background: '#6366F1',
                  border: '3px solid #4B4EC8',
                  borderRadius: 8,
                  padding: '14px 0',
                  width: '100%',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#5EEAD4',
                  letterSpacing: 6,
                  imageRendering: 'pixelated',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 0 #3538A0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 0 #3538A0, 0 0 20px rgba(99,102,241,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 0 #3538A0';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)';
                  e.currentTarget.style.boxShadow = '0 2px 0 #3538A0';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 0 #3538A0, 0 0 20px rgba(99,102,241,0.4)';
                }}
              >
                RETRY
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen Overlay */}
        {victory && victoryAnimPhase >= 3 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 50 }}>
            <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                You bought a {goalName}!
              </h1>
              <h2 className="text-xl font-bold text-gray-600 mb-6">
                Portfolio target of ₹{targetScore.toLocaleString()} reached!
              </h2>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Final Portfolio Value</div>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ₹{score.toLocaleString()}
                </div>
                
                <div className="text-sm">
                  <div className="text-gray-500">Distance Traveled</div>
                  <div className="font-bold text-gray-800">{Math.floor(distance)}m</div>
                </div>
              </div>
              
              <button
                onClick={() => resetGame(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}