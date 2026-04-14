import { View, Text, Pressable, ScrollView } from 'react-native';
import { LegendList } from '@legendapp/list';
import { StageBg } from '@shared/components/ui/stage-bg';
import { DogSprite } from '@features/dog/components/dog-sprite';
import { useDogProfile } from '@features/dog/stores/dog-store';
import { useWardrobe } from '../hooks/use-wardrobe';
import { cn } from '@lib/cn';
import type { WardrobeCategory, WardrobeItem, OutfitSlot } from '../types/wardrobe-types';

const CATEGORIES: { key: WardrobeCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hat', label: 'Hat' },
  { key: 'shirt', label: 'Shirt' },
  { key: 'pants', label: 'Pants' },
  { key: 'accessory', label: 'Acc' },
];

interface ItemCellProps {
  item: WardrobeItem;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}

function ItemCell({ item, selected, locked, onPress }: ItemCellProps) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      className={cn(
        'rounded-[16px] aspect-square items-center justify-center gap-1 border',
        selected ? 'bg-white border-primary' : 'bg-card border-transparent',
        locked && 'opacity-40',
      )}
    >
      <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
      <Text className="text-foreground text-xs font-semibold text-center px-1" numberOfLines={1}>
        {item.name}
      </Text>
      {selected && (
        <View className="absolute top-1 right-1 bg-primary rounded-full w-4 h-4 items-center justify-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
      {locked && (
        <View className="absolute bottom-1 right-1">
          <Text className="text-xs">🔒</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function WardrobeScreen() {
  const profile = useDogProfile();
  const { activeCategory, setActiveCategory, filteredItems, handleSelectItem, isSelected, isLocked, outfit } =
    useWardrobe();

  return (
    <View className="flex-1 bg-background">
      {/* Dog preview stage */}
      <StageBg height={220}>
        <View className="flex-1 items-center justify-center">
          {profile ? (
            <DogSprite
              spriteId={profile.spriteId}
              coatColor={profile.coatColor}
              mood={80}
              outfit={outfit}
            />
          ) : (
            <Text style={{ fontSize: 60 }}>🐶</Text>
          )}
        </View>
      </StageBg>

      {/* Category tabs */}
      <View className="py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveCategory(key)}
              className={cn(
                'rounded-full px-4 py-2',
                activeCategory === key ? 'bg-primary' : 'bg-card',
              )}
            >
              <Text
                className={cn(
                  'text-sm font-bold',
                  activeCategory === key ? 'text-white' : 'text-muted',
                )}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Item grid */}
      <LegendList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={4}
        recycleItems
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => (
          <ItemCell
            item={item}
            selected={isSelected(item.id, item.category as OutfitSlot)}
            locked={isLocked(item.unlockLevel)}
            onPress={() => handleSelectItem(item.id, item.category as OutfitSlot)}
          />
        )}
      />
    </View>
  );
}
