import { useCallback, useEffect, useRef, useState } from 'react';

export default function App() {
  // Game constants
  const GRAVITY = 0.7;
  const JUMP_STRENGTH = -12;
  const MOVE_SPEED = 5;
  const ACCELERATION = 0.6;
  const FRICTION = 0.82;
  const PLAYER_SIZE = 50;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;

  // Preload all game images so they're cached before gameplay
  const PRELOAD_IMAGES = [
    '/assets/player-idle.png',
    '/assets/player-left.png',
    '/assets/player-right.png',
    '/assets/bear.png',
    '/assets/bull.png',
    '/assets/platform.png',
    '/assets/air-platform.png',
    '/assets/background.png',
    '/assets/arrow-up.png',
    '/assets/arrow-down.png',
    '/assets/arrow-left.png',
    '/assets/arrow-right.png',
    '/assets/start-frame.png',
    '/assets/end-airplane.png',
    '/assets/end-phone.png',
    '/assets/end-car.png',
    '/assets/end-house.png',
    '/assets/hover-airplane.png',
    '/assets/hover-phone.png',
    '/assets/hover-car.png',
    '/assets/hover-house.png',
    '/assets/logos/ADANIGREEN.png',
    '/assets/logos/SWIGGY.png',
    '/assets/logos/JIOFIN.png',
    '/assets/logos/HINDUNILVR.png',
    '/assets/logos/PNB.png',
    '/assets/logos/GODREJPROP.png',
    '/assets/logos/IOC.png',
    '/assets/logos/SBILIFE.png',
  ];
  useEffect(() => {
    PRELOAD_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Viewport scaling — scale the fixed-resolution game to fill the browser window
  const [viewScale, setViewScale] = useState({ x: 1, y: 1 });
  const updateScale = useCallback(() => {
    setViewScale({
      x: window.innerWidth / GAME_WIDTH,
      y: window.innerHeight / GAME_HEIGHT,
    });
  }, []);
  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);
  const FLOOR_HEIGHT = 30;
  const COIN_SIZE = 30;
  const ENEMY_SIZE = 50;
  const ENEMY_HIT_COOLDOWN = 120;
  const CHUNK_WIDTH = 500;
  const GENERATE_AHEAD = 2;
  const CLEANUP_BEHIND = 3;

  const GOAL_OPTIONS = [
    { id: 'airplane', label: 'Airplane', target: 1000000, endScreen: '/assets/end-airplane.png' },
    { id: 'phone', label: 'Phone', target: 10000, endScreen: '/assets/end-phone.png' },
    { id: 'car', label: 'Car', target: 50000, endScreen: '/assets/end-car.png' },
    { id: 'house', label: 'House', target: 100000, endScreen: '/assets/end-house.png' },
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

  // Seeded random for deterministic chunk generation
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 49311;
    return x - Math.floor(x);
  };

  type LevelObj = { id: string; type: string; x: number; y: number; width: number; height: number };
  type Collectible = { id: number; x: number; y: number; logoIndex: number };
  type EnemyDef = { id: number; x: number; y: number; direction: number; speed: number; minX: number; maxX: number };
  type Powerup = { id: number; x: number; y: number };
  const POWERUP_SIZE = 45;

  const generateChunk = useCallback((chunkIndex: number) => {
    const baseX = chunkIndex * CHUNK_WIDTH;
    const r = (offset: number) => seededRandom(chunkIndex * 100 + offset);
    const objects: LevelObj[] = [];
    const coins: Collectible[] = [];
    const enemyDefs: EnemyDef[] = [];
    const powerups: Powerup[] = [];

    if (chunkIndex === 0) {
      objects.push({ id: `g-${chunkIndex}-0`, type: 'ground', x: baseX, y: GAME_HEIGHT - FLOOR_HEIGHT, width: CHUNK_WIDTH, height: FLOOR_HEIGHT });
      coins.push({ id: chunkIndex * 1000 + 1, x: baseX + 250, y: 280, logoIndex: Math.floor(r(30) * STOCK_LOGOS.length) });
      coins.push({ id: chunkIndex * 1000 + 2, x: baseX + 450, y: 290, logoIndex: Math.floor(r(31) * STOCK_LOGOS.length) });
      enemyDefs.push({ id: chunkIndex * 1000 + 1, x: baseX + 300, y: GAME_HEIGHT - FLOOR_HEIGHT - ENEMY_SIZE, direction: 1, speed: 2, minX: baseX + 100, maxX: baseX + 450 });
      return { objects, coins, enemies: enemyDefs, powerups };
    }

    const gapStart = Math.floor(r(1) * 80) + 20;
    const gapWidth = Math.floor(r(2) * 80) + 120;
    const groundBeforeEnd = gapStart;
    const groundAfterStart = gapStart + gapWidth;
    const groundAfterWidth = CHUNK_WIDTH - groundAfterStart;

    if (groundBeforeEnd > 30) {
      objects.push({ id: `g-${chunkIndex}-a`, type: 'ground', x: baseX, y: GAME_HEIGHT - FLOOR_HEIGHT, width: groundBeforeEnd, height: FLOOR_HEIGHT });
    }
    if (groundAfterWidth > 30) {
      objects.push({ id: `g-${chunkIndex}-b`, type: 'ground', x: baseX + groundAfterStart, y: GAME_HEIGHT - FLOOR_HEIGHT, width: groundAfterWidth, height: FLOOR_HEIGHT });
    }

    const platY = 170 + Math.floor(r(3) * 100);
    const platW = 100 + Math.floor(r(4) * 60);
    const platX = baseX + groundAfterStart + Math.floor(r(5) * Math.max(20, groundAfterWidth - platW - 20));
    objects.push({ id: `p-${chunkIndex}`, type: 'platform', x: platX, y: platY, width: platW, height: 24 });

    if (r(10) > 0.4) {
      const platY2 = 160 + Math.floor(r(11) * 80);
      const platW2 = 80 + Math.floor(r(12) * 50);
      const platX2 = baseX + Math.floor(r(13) * (gapStart > 60 ? gapStart - 40 : 60));
      objects.push({ id: `p2-${chunkIndex}`, type: 'platform', x: platX2, y: platY2, width: platW2, height: 24 });
    }

    const coinId = chunkIndex * 1000;
    if (groundAfterWidth > 60) {
      coins.push({ id: coinId + 1, x: baseX + groundAfterStart + 30 + Math.floor(r(6) * (groundAfterWidth - 60)), y: GAME_HEIGHT - FLOOR_HEIGHT - 50 - Math.floor(r(7) * 60), logoIndex: Math.floor(r(30) * STOCK_LOGOS.length) });
    }
    coins.push({ id: coinId + 2, x: platX + Math.floor(platW / 2) - 15, y: platY - 40, logoIndex: Math.floor(r(31) * STOCK_LOGOS.length) });

    if (r(8) > 0.5 && groundAfterWidth > 80) {
      const eX = baseX + groundAfterStart + 20 + Math.floor(r(9) * (groundAfterWidth - 60));
      enemyDefs.push({
        id: coinId + 10,
        x: eX,
        y: GAME_HEIGHT - FLOOR_HEIGHT - ENEMY_SIZE,
        direction: r(14) > 0.5 ? 1 : -1,
        speed: 1.5 + r(15) * 1,
        minX: baseX + groundAfterStart,
        maxX: baseX + groundAfterStart + groundAfterWidth - ENEMY_SIZE,
      });
    }

    // Bull powerup — ~20% chance, placed on a platform
    if (r(20) > 0.8 && chunkIndex > 1) {
      powerups.push({ id: coinId + 50, x: platX + Math.floor(platW / 2) - 20, y: platY - POWERUP_SIZE - 5 });
    }

    return { objects, coins, enemies: enemyDefs, powerups };
  }, []);

  // Dynamic level data stored in refs for instant access in the game loop
  const levelObjectsRef = useRef<LevelObj[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const collectedPowerupsRef = useRef<Set<number>>(new Set());
  const generatedChunksRef = useRef<Set<number>>(new Set());

  const [levelObjects, setLevelObjects] = useState<LevelObj[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [collectedPowerups, setCollectedPowerups] = useState<Set<number>>(new Set());

  const generateChunksAround = useCallback((offset: number) => {
    const currentChunk = Math.floor(offset / CHUNK_WIDTH);
    const startChunk = Math.max(0, currentChunk - 1);
    const endChunk = currentChunk + GENERATE_AHEAD + Math.ceil(GAME_WIDTH / CHUNK_WIDTH);
    let changed = false;

    for (let i = startChunk; i <= endChunk; i++) {
      if (!generatedChunksRef.current.has(i)) {
        generatedChunksRef.current.add(i);
        const chunk = generateChunk(i);
        levelObjectsRef.current = [...levelObjectsRef.current, ...chunk.objects];
        collectiblesRef.current = [...collectiblesRef.current, ...chunk.coins];
        powerupsRef.current = [...powerupsRef.current, ...chunk.powerups];
        setEnemies(prev => [...prev, ...chunk.enemies]);
        changed = true;
      }
    }

    // Cleanup chunks far behind
    const cleanupThreshold = (currentChunk - CLEANUP_BEHIND) * CHUNK_WIDTH;
    if (cleanupThreshold > 0) {
      levelObjectsRef.current = levelObjectsRef.current.filter(o => o.x + o.width > cleanupThreshold);
      collectiblesRef.current = collectiblesRef.current.filter(c => c.x > cleanupThreshold);
      powerupsRef.current = powerupsRef.current.filter(p => p.x > cleanupThreshold);
      setEnemies(prev => prev.filter(e => e.maxX > cleanupThreshold));
      for (const ci of generatedChunksRef.current) {
        if (ci < currentChunk - CLEANUP_BEHIND - 1) generatedChunksRef.current.delete(ci);
      }
      changed = true;
    }

    if (changed) {
      setLevelObjects([...levelObjectsRef.current]);
      setCollectibles([...collectiblesRef.current]);
      setPowerups([...powerupsRef.current]);
    }
  }, [generateChunk]);
  
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
  const [endScreenImg, setEndScreenImg] = useState('');
  
  const [enemies, setEnemies] = useState<EnemyDef[]>([]);
  
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
  const walkFrameRef = useRef(0);
  
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
  
  const resetLevelData = useCallback(() => {
    generatedChunksRef.current = new Set();
    levelObjectsRef.current = [];
    collectiblesRef.current = [];
    powerupsRef.current = [];
    collectedPowerupsRef.current = new Set();
    setLevelObjects([]);
    setCollectibles([]);
    setPowerups([]);
    setCollectedPowerups(new Set());
    setEnemies([]);
    generateChunksAround(0);
  }, [generateChunksAround]);

  const startWithGoal = (goal: typeof GOAL_OPTIONS[number]) => {
    setTargetScore(goal.target);
    targetScoreRef.current = goal.target;
    setGoalName(goal.label);
    setEndScreenImg(goal.endScreen);
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
    resetLevelData();
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
    resetLevelData();
  };
  
  // Check collision with collectibles
  const checkCollectibleCollision = (worldX: number, worldY: number) => {
    const playerCenterX = worldX + PLAYER_SIZE / 2;
    const playerCenterY = worldY + PLAYER_SIZE / 2;
    
    collectiblesRef.current.forEach(coin => {
      if (!collectedCoinsRef.current.has(coin.id)) {
        const coinCenterX = coin.x + COIN_SIZE / 2;
        const coinCenterY = coin.y + COIN_SIZE / 2;
        
        const dist = Math.sqrt(
          Math.pow(playerCenterX - coinCenterX, 2) + 
          Math.pow(playerCenterY - coinCenterY, 2)
        );
        
        if (dist < (PLAYER_SIZE / 2 + COIN_SIZE / 2)) {
          const stock = STOCK_LOGOS[coin.logoIndex ?? 0];
          setCollectedCoins(prev => new Set([...prev, coin.id]));
          collectedCoinsRef.current = new Set([...collectedCoinsRef.current, coin.id]);
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
  
  // Check collision with bull powerups — doubles portfolio
  const checkPowerupCollision = (worldX: number, worldY: number) => {
    const playerCenterX = worldX + PLAYER_SIZE / 2;
    const playerCenterY = worldY + PLAYER_SIZE / 2;

    powerupsRef.current.forEach(pu => {
      if (!collectedPowerupsRef.current.has(pu.id)) {
        const puCenterX = pu.x + POWERUP_SIZE / 2;
        const puCenterY = pu.y + POWERUP_SIZE / 2;
        const dist = Math.sqrt(
          Math.pow(playerCenterX - puCenterX, 2) +
          Math.pow(playerCenterY - puCenterY, 2)
        );
        if (dist < (PLAYER_SIZE / 2 + POWERUP_SIZE / 2)) {
          collectedPowerupsRef.current = new Set([...collectedPowerupsRef.current, pu.id]);
          setCollectedPowerups(prev => new Set([...prev, pu.id]));
          const doubled = scoreRef.current * 2;
          scoreRef.current = doubled;
          setScore(doubled);
          playSound(1000, 0.4);
          if (targetScoreRef.current > 0 && doubled >= targetScoreRef.current) {
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
    
    for (const obj of levelObjectsRef.current) {
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
      let newVelX = playerVelocityRef.current.x;
      let newVelY = playerVelocityRef.current.y;
      
      // Horizontal movement with acceleration and friction
      if (keysPressed.current['ArrowLeft']) {
        newVelX -= ACCELERATION;
      } else if (keysPressed.current['ArrowRight']) {
        newVelX += ACCELERATION;
      } else {
        newVelX *= FRICTION;
        if (Math.abs(newVelX) < 0.15) newVelX = 0;
      }
      newVelX = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, newVelX));
      
      // Apply gravity
      newVelY += GRAVITY;
      
      // Calculate new position
      let newX = playerPosRef.current.x + newVelX;
      let newY = playerPosRef.current.y + newVelY;
      
      // Keep player centered, move camera instead
      const targetPlayerX = GAME_WIDTH / 3;
      if (newX > targetPlayerX) {
        const diff = newX - targetPlayerX;
        const newWorldOffset = worldOffsetRef.current + diff;
        const actualDiff = newWorldOffset - worldOffsetRef.current;
        newX = playerPosRef.current.x + (diff - actualDiff);
        setDistance(prev => prev + actualDiff / 10);
        
        setWorldOffset(newWorldOffset);
        worldOffsetRef.current = newWorldOffset;

        generateChunksAround(newWorldOffset);
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

      // Check bull powerup collision
      if (!gameOverRef.current) {
        checkPowerupCollision(worldX, newY);
      }
      
      // Check enemy collision
      if (!gameOverRef.current) {
        checkEnemyCollision(worldX, newY, updatedEnemies);
      }
      
      // Update walk animation frame
      if (Math.abs(newVelX) > 0.3) {
        walkFrameRef.current++;
      } else {
        walkFrameRef.current = 0;
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

  const platforms = levelObjects.filter(obj => obj.type === 'platform');
  const groundSegments = levelObjects.filter(obj => obj.type === 'ground');

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#E5E7EB' }}>
      <div 
        className="relative overflow-hidden"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: '#F3F4F6',
          transform: `scale(${viewScale.x}, ${viewScale.y})`,
          transformOrigin: 'top left',
        }}
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
            filter: 'brightness(0.6) saturate(0.8)',
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
          {collectibles.map(coin => {
            const stock = STOCK_LOGOS[coin.logoIndex ?? 0];
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
                  top: -16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#000',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFD700',
                  padding: '1px 6px',
                  borderRadius: 20,
                  border: '1px solid #DAA520',
                  lineHeight: 1.4,
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

          {/* Bull Powerups */}
          {powerups.map(pu => (
            !collectedPowerups.has(pu.id) && (
              <div
                key={pu.id}
                className="absolute"
                style={{
                  left: pu.x,
                  top: pu.y,
                  width: POWERUP_SIZE,
                  height: POWERUP_SIZE,
                }}
              >
                <img
                  src="/assets/bull.png"
                  alt="Bull Powerup"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 2px 6px rgba(255,180,0,0.6))',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 7,
                  fontWeight: 'bold',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  backgroundColor: '#e63946',
                  padding: '1px 5px',
                  borderRadius: 20,
                  border: '1px solid #b5202e',
                  lineHeight: 1.4,
                }}>
                  2X
                </div>
              </div>
            )
          ))}
          
        </div>
        
        {/* Player - Hero Character — all sprites rendered, visibility toggled to avoid network flicker */}
        {(() => {
          const isIdle = Math.abs(playerVelocity.x) < 0.3;
          const walkFrame = Math.floor(walkFrameRef.current / 6) % 2;
          const flipX = keysPressed.current['ArrowLeft'] ? 'scaleX(-1)' : 'scaleX(1)';
          const spriteStyle = (visible: boolean): React.CSSProperties => ({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            transform: flipX,
            visibility: visible ? 'visible' : 'hidden',
          });
          return (
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
              <img src="/assets/player-idle.png" alt="Player" style={spriteStyle(isIdle)} />
              <img src="/assets/player-left.png" alt="Player" style={spriteStyle(!isIdle && walkFrame === 0)} />
              <img src="/assets/player-right.png" alt="Player" style={spriteStyle(!isIdle && walkFrame === 1)} />
            </div>
          );
        })()}
        
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
        
        {/* Portfolio Scoreboard */}
        <div
          className="absolute"
          style={{
            top: 10,
            right: 10,
            background: '#2D2D2D',
            border: '2px solid #00D09C',
            borderRadius: 30,
            padding: '5px 16px 5px 10px',
            minWidth: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{
            fontFamily: 'monospace',
            fontSize: 8,
            fontWeight: 'bold',
            color: '#999',
            letterSpacing: 3,
            textAlign: 'center',
            marginBottom: 2,
          }}>
            HOLDINGS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
              <path d="M18 4L30 16L18 32L6 16L18 4Z" fill="#6C7BFF" />
              <path d="M18 4L30 16L18 20L6 16L18 4Z" fill="#8B9AFF" />
              <path d="M18 4L24 10L18 16L12 10L18 4Z" fill="#AAB8FF" opacity="0.7" />
            </svg>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
            }}>
              ₹{score.toLocaleString()}
            </div>
          </div>
          {targetScore > 0 && (
            <div style={{
              fontFamily: 'monospace',
              fontSize: 8,
              fontWeight: 'bold',
              color: '#999',
              letterSpacing: 2,
              textAlign: 'center',
            }}>
              GOAL : ₹{targetScore.toLocaleString()} ({goalName.toUpperCase()})
            </div>
          )}
        </div>
        
        {/* Start Screen — Goal Selection */}
        {!gameStarted && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <div style={{ position: 'relative', width: '75%', maxWidth: 600 }}>
              <img
                src="/assets/start-frame.png"
                alt="Select Goal"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  imageRendering: 'pixelated',
                  borderRadius: 16,
                }}
              />
              {/* 4 buttons in a horizontal row aligned over the image */}
              {[
                { goal: GOAL_OPTIONS[0], left: '4.5%', hover: '/assets/hover-airplane.png' },
                { goal: GOAL_OPTIONS[1], left: '28%', hover: '/assets/hover-phone.png' },
                { goal: GOAL_OPTIONS[2], left: '51.5%', hover: '/assets/hover-car.png' },
                { goal: GOAL_OPTIONS[3], left: '75%', hover: '/assets/hover-house.png' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => startWithGoal(btn.goal)}
                  style={{
                    position: 'absolute',
                    left: btn.left,
                    top: '66%',
                    width: '21.5%',
                    height: '20.25%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                    if (img) img.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                    if (img) img.style.opacity = '0';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={btn.hover}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'fill',
                      imageRendering: 'pixelated',
                      opacity: 0,
                      transition: 'opacity 0.1s',
                      pointerEvents: 'none',
                    }}
                  />
                </button>
              ))}
            </div>
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
                borderRadius: 16,
                padding: '20px 24px 18px',
                width: 300,
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(0, 208, 156, 0.15)',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#00D09C',
                  letterSpacing: 4,
                  imageRendering: 'pixelated',
                  marginBottom: 16,
                  textShadow: '0 0 20px rgba(0, 208, 156, 0.4)',
                }}
              >
                GAME OVER
              </div>

              <div
                style={{
                  background: '#1E1E1E',
                  borderRadius: 30,
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4L30 16L18 32L6 16L18 4Z" fill="#6C7BFF" />
                  <path d="M18 4L30 16L18 20L6 16L18 4Z" fill="#8B9AFF" />
                  <path d="M18 4L24 10L18 16L12 10L18 4Z" fill="#AAB8FF" opacity="0.7" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#888',
                      letterSpacing: 2,
                      marginBottom: 1,
                    }}
                  >
                    HOLDINGS
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#FFF',
                    }}
                  >
                    ₹{score.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => resetGame(true)}
                style={{
                  background: '#6366F1',
                  border: '3px solid #4B4EC8',
                  borderRadius: 8,
                  padding: '10px 0',
                  width: '100%',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 22,
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
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          >
            <div style={{ position: 'relative', maxHeight: 320, display: 'flex', justifyContent: 'center' }}>
              <img
                src={endScreenImg}
                alt={`You bought a ${goalName}!`}
                style={{
                  maxHeight: 320,
                  width: 'auto',
                  display: 'block',
                  imageRendering: 'pixelated',
                  borderRadius: 12,
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '9%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: 16,
                color: '#fff',
                letterSpacing: 3,
                lineHeight: 1.4,
                backgroundColor: '#1a3a33',
                padding: '2px 0',
                borderRadius: 4,
              }}>
                {Math.floor(distance)} METER
              </div>
            </div>
            <button
              onClick={() => resetGame(true)}
              style={{
                marginTop: 10,
                background: '#00D09C',
                border: '3px solid #00B886',
                borderRadius: 8,
                padding: '6px 30px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#fff',
                letterSpacing: 3,
                imageRendering: 'pixelated',
                transition: 'transform 0.15s',
                boxShadow: '0 4px 0 #009B74',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              RESTART
            </button>
          </div>
        )}
      </div>
    </div>
  );
}