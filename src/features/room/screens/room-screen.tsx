import { View, Pressable, ScrollView } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { LinearGradient } from 'expo-linear-gradient';
import { LegendList } from '@legendapp/list';
import {
  useRoomState,
  usePlaceItem,
  useRemoveItem,
  useSetActiveSeason,
} from '../stores/room-store';
import { ROOM_ITEMS } from '../constants/room-items';
import { DogSprite } from '@features/dog/components/dog-sprite';
import { useDogProfile, useDogOutfit } from '@features/dog/stores/dog-store';
import { cn } from '@lib/cn';
import type { Season, ActiveSeason } from '../types/room-types';

const SEASON_GRADIENTS: Record<Season, [string, string]> = {
  spring: ['#FFE4EC', '#FFCBA4'],
  summer: ['#FFE9A8', '#BDE0FE'],
  fall: ['#FFCBA4', '#FFE9A8'],
  winter: ['#D8C8F6', '#BDE0FE'],
};

const SEASONS: { key: ActiveSeason; label: string; emoji: string }[] = [
  { key: 'auto', label: 'Auto', emoji: '🌈' },
  { key: 'spring', label: 'Spring', emoji: '🌸' },
  { key: 'summer', label: 'Summer', emoji: '☀️' },
  { key: 'fall', label: 'Fall', emoji: '🍂' },
  { key: 'winter', label: 'Winter', emoji: '❄️' },
];

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1–12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function resolveSeason(activeSeason: ActiveSeason): Season {
  return activeSeason === 'auto' ? getCurrentSeason() : activeSeason;
}

export default function RoomScreen() {
  const { data: roomState } = useRoomState();
  const profile = useDogProfile();
  const outfit = useDogOutfit();
  const placeItem = usePlaceItem();
  const removeItem = useRemoveItem();
  const setActiveSeason = useSetActiveSeason();

  const season = resolveSeason(roomState?.activeSeason ?? 'auto');
  const gradient = SEASON_GRADIENTS[season];
  const placedIds = new Set(roomState?.placedItems.map(i => i.itemId) ?? []);

  return (
    <View className="flex-1 bg-background">
      {/* Room scene */}
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 280, width: '100%' }}
      >
        {/* Placed items */}
        <View className="flex-1">
          {roomState?.placedItems.map(placed => {
            const item = ROOM_ITEMS.find(i => i.id === placed.itemId);
            if (!item) return null;
            return (
              <Pressable
                key={placed.itemId}
                onPress={() => removeItem(placed.itemId)}
                style={{
                  position: 'absolute',
                  left: `${placed.x * 100}%`,
                  top: `${placed.y * 100}%`,
                }}
              >
                <AppText style={{ fontSize: 32 }}>{item.emoji}</AppText>
              </Pressable>
            );
          })}

          {/* Dog idle in room */}
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              marginLeft: -90,
            }}
          >
            {profile ? (
              <DogSprite
                spriteId={profile.spriteId}
                coatColor={profile.coatColor}
                mood={80}
                outfit={outfit}
              />
            ) : (
              <AppText style={{ fontSize: 60 }}>🐶</AppText>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Season switcher */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2"
        >
          {SEASONS.map(({ key, label, emoji }) => (
            <Pressable
              key={key}
              onPress={() => setActiveSeason(key)}
              className={cn(
                'flex-row items-center gap-1 rounded-full px-3 py-2',
                (roomState?.activeSeason ?? 'auto') === key
                  ? 'bg-primary'
                  : 'bg-card',
              )}
            >
              <AppText>{emoji}</AppText>
              <AppText
                className={cn(
                  'text-sm font-bold',
                  (roomState?.activeSeason ?? 'auto') === key
                    ? 'text-white'
                    : 'text-muted',
                )}
              >
                {label}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Room items grid */}
      <LegendList
        data={ROOM_ITEMS}
        keyExtractor={item => item.id}
        numColumns={4}
        recycleItems
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 12,
        }}
        renderItem={({ item }) => {
          const isPlaced = placedIds.has(item.id);
          return (
            <Pressable
              onPress={() => {
                if (isPlaced) {
                  removeItem(item.id);
                } else {
                  placeItem({
                    itemId: item.id,
                    x: 0.2 + Math.random() * 0.6,
                    y: 0.1 + Math.random() * 0.5,
                  });
                }
              }}
              className={cn(
                'rounded-[16px] aspect-square items-center justify-center gap-1 border',
                isPlaced
                  ? 'bg-white border-primary'
                  : 'bg-card border-transparent',
              )}
            >
              <AppText style={{ fontSize: 28 }}>{item.emoji}</AppText>
              <AppText
                weight="semibold"
                className="text-foreground text-xs text-center px-1"
                numberOfLines={1}
              >
                {item.name}
              </AppText>
              {isPlaced && (
                <View className="absolute top-1 right-1 bg-primary rounded-full w-4 h-4 items-center justify-center">
                  <AppText className="text-white text-xs">✓</AppText>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
