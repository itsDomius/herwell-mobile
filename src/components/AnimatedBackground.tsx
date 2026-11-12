import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();

  const posA = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const posB = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const posC = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;
  const scaleC = useRef(new Animated.Value(1)).current;
  const rotA = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (anim: Animated.CompositeAnimation) => Animated.loop(anim);

    const animA = loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(posA, { toValue: { x: 30, y: -40 }, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleA, { toValue: 1.15, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posA, { toValue: { x: -20, y: 20 }, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleA, { toValue: 0.9, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posA, { toValue: { x: 0, y: 0 }, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleA, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    const animB = loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(posB, { toValue: { x: -40, y: 30 }, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleB, { toValue: 1.2, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posB, { toValue: { x: 25, y: -20 }, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleB, { toValue: 0.85, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posB, { toValue: { x: 0, y: 0 }, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleB, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    const animC = loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(posC, { toValue: { x: 20, y: 50 }, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleC, { toValue: 1.1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posC, { toValue: { x: -30, y: -30 }, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleC, { toValue: 0.9, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(posC, { toValue: { x: 0, y: 0 }, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scaleC, { toValue: 1, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    const animRot = loop(
      Animated.timing(rotA, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
    );

    animA.start();
    animB.start();
    animC.start();
    animRot.start();

    return () => { animA.stop(); animB.stop(); animC.stop(); animRot.stop(); };
  }, []);

  const rotate = rotA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Blob A — large top-left purple */}
      <Animated.View
        style={[s.blob, s.blobA, {
          backgroundColor: colors.blobA,
          transform: [{ translateX: posA.x }, { translateY: posA.y }, { scale: scaleA }, { rotate }],
        }]}
      />
      {/* Blob B — mid blue-sky */}
      <Animated.View
        style={[s.blob, s.blobB, {
          backgroundColor: colors.blobB,
          transform: [{ translateX: posB.x }, { translateY: posB.y }, { scale: scaleB }],
        }]}
      />
      {/* Blob C — bottom accent */}
      <Animated.View
        style={[s.blob, s.blobC, {
          backgroundColor: colors.blobC,
          transform: [{ translateX: posC.x }, { translateY: posC.y }, { scale: scaleC }],
        }]}
      />
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobA: { width: 320, height: 320, top: -80, left: -60 },
  blobB: { width: 260, height: 260, top: 200, right: -80 },
  blobC: { width: 280, height: 280, bottom: 60, left: -40 },
  content: { flex: 1, zIndex: 10 },
});
