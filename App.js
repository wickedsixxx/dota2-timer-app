import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ASSETS = {
  bountyRune: require('./assets/74px-rune_bounty_abilityicon_dota2_wikiasset.png'),
  waterRune: require('./assets/74px-rune_water_abilityicon_dota2_wikiasset.png'),
  powerUpRuneHaste: require('./assets/74px-rune_haste_abilityicon_dota2_gameasset.png'), // Örnek olarak Haste ekledim
  glyphOfFortification: require('./assets/74px-glyph_of_fortification_abilityicon_dota2_gameasset.png'),
  roshan: require('./assets/150px-roshan_model.png'),
  tormentor: require('./assets/150px-tormentor_radiant_model.png'),
  healingLotus: require('./assets/86px-healing_lotus_eat_lotus_abilityicon_dota2_wikiasset.png'),
  powerUpRunesGif: require('./assets/dota2PowerUpRuneGif.gif'),
  shrineOfWisdom: require('./assets/86px-shrine_of_wisdom_experience_fountain_abilityicon_dota2_wikiasset.png'),
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [mainTime, setMainTime] = useState(-75); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setMainTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds) => {
    const absoluteSeconds = Math.abs(totalSeconds);
    const minutes = Math.floor(absoluteSeconds / 60);
    const seconds = absoluteSeconds % 60;
    const sign = totalSeconds < 0 ? "-" : "";
    return `${sign}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- CONTENT: MENU SECTION (Değişken olarak tanımladık) ---
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
            <Text style={styles.cardLabel}>İstatistikler</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.menuCard, styles.greyCard]}>
            <Ionicons name="settings-outline" size={34} color="white" />
            <Text style={styles.cardLabel}>Ayarlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuCard, styles.orangeCard]}>
            <Ionicons name="information-circle-outline" size={38} color="white" />
            <Text style={styles.cardLabel}>Hakkında</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // --- CONTENT: TIMERS SECTION (Değişken olarak tanımladık) ---
  const timerContent = (
    <View style={styles.screenContainer}>
      <TouchableOpacity onPress={() => setCurrentScreen('menu')} style={styles.navigationButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.navigationText}>Menu</Text>
      </TouchableOpacity>

      <View style={styles.masterTimerWrapper}>
        <TouchableOpacity 
          style={[styles.masterButton, isTimerRunning && styles.masterButtonActive]}
          onPress={() => setIsTimerRunning(!isTimerRunning)}
        >
          <Text style={styles.masterTimeText}>{formatTime(mainTime)}</Text>
          <Text style={styles.masterStatusText}>{isTimerRunning ? "PAUSE" : "START GAME"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ROW 1: Bounty, Water, Power */}
        <View style={styles.timerRow}>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}><Image source={ASSETS.bountyRune} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Bounty</Text>
             <Text style={styles.subTimerValue}>04:00</Text>
          </View>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}><Image source={ASSETS.waterRune} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Water</Text>
             <Text style={styles.subTimerValue}>02:00</Text>
          </View>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}>
                <Image source={ASSETS.powerUpRunesGif} style={styles.buttonImage} />
             </View>
             <Text style={styles.subTimerTitle}>Power Up</Text>
             <Text style={styles.subTimerValue}>02:00</Text>
          </View>
        </View>

        {/* ROW 2: Lotus, Wisdom */}
        <View style={[styles.timerRow, styles.centerRow]}>
          <View style={styles.subTimerCardTwo}>
             <View style={styles.iconBox}><Image source={ASSETS.healingLotus} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Lotus</Text>
             <Text style={styles.subTimerValue}>03:00</Text>
          </View>
          <View style={styles.subTimerCardTwo}>
             <View style={styles.iconBox}><Image source={ASSETS.shrineOfWisdom} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Wisdom</Text>
             <Text style={styles.subTimerValue}>07:00</Text>
          </View>
        </View>

        {/* ROW 3: Roshan, Tormentor, Glyph */}
        <View style={styles.timerRow}>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}><Image source={ASSETS.roshan} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Roshan</Text>
             <Text style={styles.subTimerValue}>08:00</Text>
          </View>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}><Image source={ASSETS.tormentor} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Tormentor</Text>
             <Text style={styles.subTimerValue}>20:00</Text>
          </View>
          <View style={styles.subTimerCardThree}>
             <View style={styles.iconBox}><Image source={ASSETS.glyphOfFortification} style={styles.buttonImage} /></View>
             <Text style={styles.subTimerTitle}>Glyph</Text>
             <Text style={styles.subTimerValue}>05:00</Text>
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
    </SafeAreaView>
  );
}

// Stiller aynı kalıyor...
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
  subTimerTitle: { color: '#8A92A6', fontSize: 11 },
  subTimerValue: { color: 'white', fontSize: 15, fontWeight: 'bold' }
});