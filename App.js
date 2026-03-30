import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { AppState, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ASSETS = {

  /*images*/
  bountyRune: require('./assets/Images/74px-rune_bounty_abilityicon_dota2_wikiasset.png'),
  waterRune: require('./assets/Images/74px-rune_water_abilityicon_dota2_wikiasset.png'),
  powerUpRuneHaste: require('./assets/Images/74px-rune_haste_abilityicon_dota2_gameasset.png'),
  glyphOfFortification: require('./assets/Images/74px-glyph_of_fortification_abilityicon_dota2_gameasset.png'),
  roshan: require('./assets/Images/150px-roshan_model.png'),
  tormentor: require('./assets/Images/150px-tormentor_radiant_model.png'),
  healingLotus: require('./assets/Images/86px-healing_lotus_eat_lotus_abilityicon_dota2_wikiasset.png'),
  shrineOfWisdom: require('./assets/Images/86px-shrine_of_wisdom_experience_fountain_abilityicon_dota2_wikiasset.png'),
  /*GIF*/
  powerUpRunesGif: require('./assets/GIF/dota2PowerUpRuneGif.gif'),
  /*sounds*/
  bountyRuneTimerExpiredSound: require('./assets/Sounds/Items_rune_bounty.mp3'), // Dosya isimlerin neyse ona göre düzelt
  waterRuneTimerExpiredSound: require('./assets/Sounds/Items_rune_water.mp3'),
  powerUpRuneTimerExpiredSound: require('./assets/Sounds/Items_rune_regen.mp3'),
  shrineOfWisdomTimerExpiredSound: require('./assets/Sounds/Items_shrineOfWisdom_Activate_Sound.mp3'),
  roshanTimerExpiredSound: require('./assets/Sounds/Misc_rosh_death.mp3'),

};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [gameTime, setGameTime] = useState(-75);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const appState = useRef(AppState.currentState);
  const startTimeRef = useRef(null);
  const baseTimeRef = useRef(-75);

  // --- 1. ZAMAN GÜNCELLEME MANTIĞI ---
const updateTime = () => {
  if (startTimeRef.current !== null) {
    const now = Date.now();
    // Tam olarak kaç saniye geçtiğini hesapla
    const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
    
    // Ana süreyi güncelle (Taban süre + geçen süre)
    setGameTime(baseTimeRef.current + elapsedSeconds);
  }
};

  // --- 2. VERİ YÜKLEME (STORAGE) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedStartTime = await AsyncStorage.getItem('@start_time');
        const savedBaseTime = await AsyncStorage.getItem('@base_time');
        const savedIsRunning = await AsyncStorage.getItem('@is_running');

        if (savedIsRunning === 'true' && savedStartTime) {
          startTimeRef.current = parseInt(savedStartTime);
          baseTimeRef.current = parseInt(savedBaseTime);
          setIsTimerRunning(true);
          updateTime();
        } else if (savedBaseTime) {
          const bTime = parseInt(savedBaseTime);
          baseTimeRef.current = bTime;
          setGameTime(bTime);
        }
      } catch (e) { console.error("Load Error", e); }
    };


    loadData();
  }, []);

  const lastPlayedSecondRef = useRef(null);

  useEffect(() => {
    // Saniye değişmediyse veya zamanlayıcı duruyorsa işlem yapma
    if (!isTimerRunning || lastPlayedSecondRef.current === gameTime) return;

    // --- TAM ZAMANINDA (00:00) ÇALMA KURALLARI ---

    // 1. BOUNTY RÜNÜ (Her 4 dakikada bir: 0, 240, 480...)
    if (gameTime >= 0 && gameTime % 240 === 0) {
      playSound(ASSETS.bountyRuneTimerExpiredSound);
    }

    // 2. WATER RÜNÜ (Sadece 2. ve 4. dakikada: 120, 240)
    if (gameTime === 120 || gameTime === 240) {
      playSound(ASSETS.waterRuneTimerExpiredSound); // Water için özel sesin varsa onu koyabilirsin
    }

    // 3. POWER UP RÜNÜ (6. dakikadan itibaren her 2 dakikada bir)
    if (gameTime >= 360 && gameTime % 120 === 0) {
      playSound(ASSETS.powerUpRuneTimerExpiredSound);
    }

    // 4. WISDOM RÜNÜ (7. dakikadan itibaren her 7 dakikada bir)
    if (gameTime > 0 && gameTime % 420 === 0) {
      playSound(ASSETS.shrineOfWisdomTimerExpiredSound);
    }

    lastPlayedSecondRef.current = gameTime;
  }, [gameTime, isTimerRunning]);

  // --- 3. TIMER DÖNGÜSÜ ---
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(updateTime, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- 4. ARKA PLAN SENKRONİZASYONU ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isTimerRunning) updateTime();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isTimerRunning]);

  const toggleTimer = async () => {
    const newStatus = !isTimerRunning;
    if (newStatus) {
      const now = Date.now();
      startTimeRef.current = now;
      baseTimeRef.current = gameTime;
      await AsyncStorage.setItem('@start_time', now.toString());
      await AsyncStorage.setItem('@base_time', gameTime.toString());
      await AsyncStorage.setItem('@is_running', 'true');
    } else {
      await AsyncStorage.setItem('@is_running', 'false');
      await AsyncStorage.setItem('@base_time', gameTime.toString());
      startTimeRef.current = null;
    }
    setIsTimerRunning(newStatus);
  };
  const resetTimer = async () => {
    setIsTimerRunning(false);
    const initialTime = -75;
    setGameTime(initialTime);
    baseTimeRef.current = initialTime;
    startTimeRef.current = null;

    // Hafızayı temizle
    await AsyncStorage.setItem('@is_running', 'false');
    await AsyncStorage.setItem('@base_time', initialTime.toString());
    await AsyncStorage.removeItem('@start_time');

    setEditModalVisible(false); // Pencereyi kapat
  };

  const adjustMinutes = (amount) => {
  if (isTimerRunning) {
    // --- OYUN AKARKEN (START) ---
    // Zaman çizgisini (startTimeRef) kaydırıyoruz. 
    // Bu işlem saniyenin akışını bozmaz, sadece 'başlangıç noktasını' iter.
    startTimeRef.current -= (amount * 1000);
    
    // Ekranda değişikliği anında (milisaniye beklemeden) görmek için
    updateTime();
  } else {
    // --- OYUN DURURKEN (PAUSE) ---
    // Sadece taban süreyi (baseTime) güncelliyoruz.
    const newBase = baseTimeRef.current + amount;
    baseTimeRef.current = newBase;
    setGameTime(newBase);
    
    // Hafızaya kaydet
    AsyncStorage.setItem('@base_time', newBase.toString());
  }
};

 const formatTime = (totalSeconds) => {
  // Eğer süre -0.9 ile 0 arasındaysa ekranda -0:00 görünmemesi için 
  // totalSeconds === 0 kontrolü yapabilirsin ama abs yeterli olacaktır.
  const absoluteSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absoluteSeconds / 60);
  const seconds = absoluteSeconds % 60;
  
  // Sadece süre tam olarak 0'dan küçükse eksi işareti koy
  const sign = totalSeconds < 0 ? "-" : "";
  return `${sign}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

  const playSound = async (soundAsset) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundAsset);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("An error occurred while playing the sound effect", error);
    }
  };

  // Rün Döngüleri
  // Genel hesaplama yardımcı fonksiyonu
// --- DOTA 2 OBJECTIVE LOGIC ---
  const calculateObjective = (cycle, firstSpawn, startsInPreGame = false) => {
    // 1. HAZIRLIK EVRESİ (Oyun zamanı negatifken)
    if (gameTime < 0) {
      if (startsInPreGame) {
        // Bounty: 00:00'a kadar olan süreyi geri sayar
        return formatTime(Math.abs(gameTime));
      } else {
        // Diğerleri: İlk çıkış sürelerinde sabit bekler
        return formatTime(firstSpawn);
      }
    }

    // 2. OYUN BAŞLADI (Horn çaldı, gameTime >= 0)
    if (gameTime < firstSpawn) {
      return formatTime(firstSpawn - gameTime);
    }

    // 3. DÖNGÜSEL ÇIKIŞ
    const timeSinceFirst = gameTime - firstSpawn;
    const remaining = cycle - (timeSinceFirst % cycle);
    return formatTime(remaining === 0 ? cycle : remaining);
  };

  // Rün Tanımlamaları
  const getBountyRuneTime = () => calculateObjective(240, 0, true);
  const getWaterRuneTime = () => {
    if (gameTime >= 240) return "Done";
    return calculateObjective(120, 120, false);
  };
  const getHealingLotusTime = () => calculateObjective(180, 180, false);
  const getShrineOfWisdomTime = () => calculateObjective(420, 420, false);
  const getPowerUpRuneTime = () => calculateObjective(120, 360, false);

  const getRoshanTime = () => {
    // Roshan ve Tormentor genelde manuel tetiklenir ama 
    // buraya oyun başından itibaren ne kadar olduğunu yazabiliriz
    return "Click"; // İleride buna tıklandığında geri sayım ekleyeceğiz
  };

  const menuContent = (
    <View style={styles.screenContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.mainTitle}>Dota 2 Timer</Text>
        <Text style={styles.subTitle}>Own the objectives. Own the game.</Text>
      </View>
      <View style={styles.buttonGrid}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.menuCard, styles.tealCard]} onPress={() => setCurrentScreen('timers')}>
            <Ionicons name="timer-outline" size={36} color="white" />
            <Text style={styles.cardLabel}>Timers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuCard, styles.purpleCard]}>
            <MaterialCommunityIcons name="chart-bar" size={36} color="white" />
            <Text style={styles.cardLabel}>*default timer*</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.menuCard, styles.greyCard]}>
            <Ionicons name="settings-outline" size={34} color="white" />
            <Text style={styles.cardLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuCard, styles.orangeCard]}>
            <Ionicons name="information-circle-outline" size={38} color="white" />
            <Text style={styles.cardLabel}>About</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const isWaterStage = gameTime < 240;
  const dynamicRuneData = {
    title: isWaterStage ? "Water Rune" : "Power Rune",
    image: isWaterStage ? ASSETS.waterRune : ASSETS.powerUpRunesGif,
    timer: isWaterStage ? getWaterRuneTime() : getPowerUpRuneTime()
  };

  const timerContent = (
    <View style={styles.screenContainer}>
      <TouchableOpacity onPress={() => setCurrentScreen('menu')} style={styles.navigationButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.navigationText}>Menu</Text>
      </TouchableOpacity>

      <View style={styles.masterTimerWrapper}>
        <TouchableOpacity
          style={[styles.masterButton, isTimerRunning && styles.masterButtonActive]}
          onPress={toggleTimer} 
          onLongPress={() => setEditModalVisible(true)}
          delayLongPress={600} // 0.6 saniye basılı tutunca tetiklenir
        >
          <Text style={styles.masterTimeText}>{formatTime(gameTime)}</Text>
          <Text style={styles.masterStatusText}>{isTimerRunning ? "PAUSE" : "START"}</Text>
        </TouchableOpacity>
      </View>
      {/* ROW 1 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ROW 1: Bounty ve Dinamik Rün (Water -> Power) */}
        <View style={[styles.timerRow, styles.centerRow]}>

          {/* Bounty Kartı */}
          <View style={styles.subTimerCardTwo}>
            <View style={styles.iconBox}>
              <Image source={ASSETS.bountyRune} style={styles.buttonImage} />
            </View>
            <Text style={styles.subTimerTitle}>Bounty</Text>
            <Text style={styles.subTimerValue}>{getBountyRuneTime()}</Text>
          </View>

          {/* Dinamik Kart: 4. dk'ya kadar Water, sonra Power Up */}
          <View style={styles.subTimerCardTwo}>
            <View style={styles.iconBox}>
              <Image source={dynamicRuneData.image} style={styles.buttonImage} />
            </View>
            <Text style={styles.subTimerTitle}>{dynamicRuneData.title}</Text>
            <Text style={styles.subTimerValue}>{dynamicRuneData.timer}</Text>
          </View>

        </View>
        {/* ROW 2 */}
        <View style={[styles.timerRow, styles.centerRow]}>
          <View style={styles.subTimerCardTwo}>
            <View style={styles.iconBox}><Image source={ASSETS.healingLotus} style={styles.buttonImage} /></View>
            <Text style={styles.subTimerTitle}>Lotus</Text>
            <Text style={styles.subTimerValue}>{getHealingLotusTime()}</Text>
          </View>
          <View style={styles.subTimerCardTwo}>
            <View style={styles.iconBox}><Image source={ASSETS.shrineOfWisdom} style={styles.buttonImage} /></View>
            <Text style={styles.subTimerTitle}>Wisdom</Text>
            <Text style={styles.subTimerValue}>{getShrineOfWisdomTime()}</Text>
          </View>
        </View>
        {/* ROW 3 */}
        <View style={styles.timerRow}>
          <View style={styles.subTimerCardThree}>
            <View style={styles.iconBox}><Image source={ASSETS.roshan} style={styles.buttonImage} /></View>
            <Text style={styles.subTimerTitle}>Roshan</Text>
            <Text style={styles.subTimerValue}>Dead</Text>
          </View>
          <View style={styles.subTimerCardThree}>
            <View style={styles.iconBox}><Image source={ASSETS.tormentor} style={styles.buttonImage} /></View>
            <Text style={styles.subTimerTitle}>Tormentor</Text>
            <Text style={styles.subTimerValue}>20:00</Text>
          </View>
          <View style={styles.subTimerCardThree}>
            <View style={styles.iconBox}><Image source={ASSETS.glyphOfFortification} style={styles.buttonImage} /></View>
            <Text style={styles.subTimerTitle}>Glyph</Text>
            <Text style={styles.subTimerValue}>Ready</Text>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {currentScreen === 'menu' ? menuContent : timerContent}

      {/* DÜZENLEME MODAL (PENCERESİ) */}
      {isEditModalVisible && (
        <View style={styles.editOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Change Timer</Text>

            <View style={styles.editRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => adjustMinutes(-60)} // 1 dk çıkar
              >
                <Text style={styles.editBtnText}>-1 dk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => adjustMinutes(60)} // 1 dk ekle
              >
                <Text style={styles.editBtnText}>+1 dk</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.closeBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F1219' },
  screenContainer: { flex: 1, paddingHorizontal: 20 },
  headerSection: { marginTop: 40, marginBottom: 40, alignItems: 'center' },
  mainTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  subTitle: { color: '#8A92A6', fontSize: 16, marginTop: 4 },
  buttonGrid: { width: '100%' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  menuCard: { width: '48%', aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1F2B' },
  cardLabel: { color: 'white', fontSize: 15, marginTop: 12, fontWeight: '600' },
  tealCard: { backgroundColor: '#00D2B8' },
  purpleCard: { backgroundColor: '#8A2BE2' },
  greyCard: { backgroundColor: '#2A2F3B' },
  orangeCard: { backgroundColor: '#FFA500' },
  navigationButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  navigationText: { color: 'white', marginLeft: 8, fontSize: 16 },
  masterTimerWrapper: { alignItems: 'center', marginTop: 50, marginBottom: 50 },
  masterButton: { width: 220, height: 90, backgroundColor: '#1A1F2B', borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E53E3E' },
  masterButtonActive: { borderColor: '#48BB78', backgroundColor: '#1E2533' },
  masterTimeText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  masterStatusText: { color: '#8A92A6', fontSize: 11, fontWeight: '800', marginTop: 4 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  centerRow: { justifyContent: 'center', gap: 15 },
  subTimerCardThree: { width: '31%', backgroundColor: '#1A1F2B', borderRadius: 15, paddingVertical: 12, alignItems: 'center' },
  subTimerCardTwo: { width: '45%', backgroundColor: '#1A1F2B', borderRadius: 15, paddingVertical: 12, alignItems: 'center' },
  iconBox: { width: 50, height: 50, backgroundColor: '#0F1219', borderRadius: 12, overflow: 'hidden' },
  buttonImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  subTimerTitle: { color: '#8A92A6', fontSize: 13 },
  subTimerValue: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  editCard: {
    width: '80%',
    backgroundColor: '#1A1F2B',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3142',
  },
  editTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  editRow: { flexDirection: 'row', gap: 15 },
  editBtn: { backgroundColor: '#2A3142', padding: 15, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  editBtnText: { color: 'white', fontWeight: '600' },
  resetBtn: { backgroundColor: '#E53E3E', width: '100%', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  resetBtnText: { color: 'white', fontWeight: 'bold' },
  closeBtn: { marginTop: 20 },
  closeBtnText: { color: '#8A92A6', fontSize: 14 }
});