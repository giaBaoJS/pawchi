import { resolveAvatar } from '@features/dog-avatar/utils/resolve-avatar';
import { Image } from '@shared/components/styled';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { KawaiiStepper } from '@shared/components/ui/kawaii-stepper';
import { cn } from '@lib/cn';
import { lightHaptic, mediumHaptic } from '@shared/utils/haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Dialog } from 'heroui-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { useCSSVariable } from 'uniwind';
import { useDogProfileStore } from '../stores/dog-profile-store';
import type { BodySize, DogProfile } from '../types/dog-profile';

interface NameDogParams {
  breed: string;
  bodySize: BodySize;
  coatColor: string;
  coatPattern: string;
  photoUri: string;
}

type OnboardingStep = 0 | 1 | 2;
type Gender = DogProfile['gender'];

const STEPS = [
  { id: 'name', label: 'Name' },
  { id: 'dob', label: 'DOB' },
  { id: 'gender', label: 'Gender' },
];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function NameDogScreen() {
  const params = useLocalSearchParams<Record<keyof NameDogParams, string>>();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [name, setName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const existingProfile = useDogProfileStore(s => s.profile);
  const setProfile = useDogProfileStore(s => s.setProfile);
  const placeholder = useCSSVariable('--color-muted') as string;

  const trimmed = name.trim();
  const isNameValid = trimmed.length >= 1 && trimmed.length <= 20;
  const dob =
    selectedMonth != null && selectedYear != null
      ? makeDobEpoch(selectedYear, selectedMonth)
      : null;
  const isDobValid = dob != null;
  const isGenderValid = gender != null;
  const canContinue =
    (step === 0 && isNameValid) ||
    (step === 1 && isDobValid) ||
    (step === 2 && isGenderValid);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 26 }, (_, index) => currentYear - index);
  }, []);

  const breed = params.breed ?? 'Mixed Breed';
  const bodySize = (params.bodySize as BodySize) ?? 'medium';
  const coatColor = params.coatColor ?? '';
  const coatPattern = params.coatPattern ?? '';
  const photoUri = params.photoUri ?? '';

  function commit() {
    if (dob == null || gender == null) return;

    const profile: DogProfile = {
      id: `dog_${Date.now()}`,
      name: trimmed,
      dob,
      gender,
      breed,
      bodySize,
      coatColor,
      coatPattern,
      avatarId: resolveAvatar({ breed, bodySize }),
      photoUri,
      createdAt: Date.now(),
    };
    setProfile(profile);
    // dismissAll clears the scan modal stack (scan -> result -> name-dog)
    // before replacing with home so home renders full-screen.
    router.dismissAll();
    router.replace('/home');
  }

  function onSave() {
    if (!isNameValid || !isDobValid || !isGenderValid) return;
    mediumHaptic();
    if (existingProfile) {
      setShowReplaceDialog(true);
      return;
    }
    commit();
  }

  function goNext() {
    if (!canContinue) return;

    if (step === 0) {
      lightHaptic();
      setStep(1);
      return;
    }

    if (step === 1) {
      lightHaptic();
      setStep(2);
      return;
    }

    onSave();
  }

  function goBack() {
    lightHaptic();
    if (step === 0) {
      router.back();
      return;
    }
    setStep(current => (current - 1) as OnboardingStep);
  }

  return (
    <KawaiiScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 pt-8 gap-7">
          <KawaiiStepper steps={STEPS} currentStep={step} />

          <View className="items-center gap-3">
            {photoUri ? (
              <View className="rounded-full p-1.5 bg-overlay border border-border-soft">
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  contentFit="cover"
                />
              </View>
            ) : null}
            <View className="bg-overlay border border-border-soft px-4 py-1.5 rounded-full">
              <AppText
                weight="bold"
                className="text-foreground-secondary text-xs"
              >
                {breed}
              </AppText>
            </View>
          </View>

          <View className="flex-1">
            {step === 0 ? (
              <NameStep
                name={name}
                placeholder={placeholder}
                onNameChange={setName}
                onSubmit={goNext}
              />
            ) : null}

            {step === 1 ? (
              <DobStep
                years={years}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSelectMonth={setSelectedMonth}
                onSelectYear={setSelectedYear}
              />
            ) : null}

            {step === 2 ? (
              <GenderStep gender={gender} onSelectGender={setGender} />
            ) : null}
          </View>

          <View className="gap-3">
            <KawaiiButton
              tone={canContinue ? 'primary' : 'soft'}
              isDisabled={!canContinue}
              onPress={goNext}
              label={step === 2 ? 'Save' : 'Next'}
            />
            <KawaiiButton tone="ghost" onPress={goBack} label="Back" />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Dialog isOpen={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Replace your dog?</Dialog.Title>
            <Dialog.Description>
              You already have {existingProfile?.name}. Saving {trimmed} will
              replace them. Progress stays with your account.
            </Dialog.Description>
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <KawaiiButton
                  tone="soft"
                  label="Cancel"
                  onPress={() => setShowReplaceDialog(false)}
                />
              </View>
              <View className="flex-1">
                <KawaiiButton
                  tone="primary"
                  label="Replace"
                  onPress={() => {
                    setShowReplaceDialog(false);
                    commit();
                  }}
                />
              </View>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </KawaiiScreen>
  );
}

function NameStep({
  name,
  placeholder,
  onNameChange,
  onSubmit,
}: {
  name: string;
  placeholder: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View className="gap-3">
      <AppText
        fontFamily="heading"
        className="text-foreground text-2xl text-center -tracking-wide"
      >
        What&apos;s your dog&apos;s name?
      </AppText>
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter a name"
        autoFocus
        maxLength={20}
        className="bg-overlay border border-border-soft rounded-2xl px-5 py-4 text-foreground text-lg text-center"
        placeholderTextColor={placeholder}
        returnKeyType="next"
        onSubmitEditing={onSubmit}
      />
      <AppText
        weight="medium"
        className="text-foreground-secondary text-xs text-center"
      >
        1-20 characters
      </AppText>
    </View>
  );
}

function DobStep({
  years,
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
}: {
  years: number[];
  selectedMonth: number | null;
  selectedYear: number | null;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
}) {
  return (
    <View className="gap-5">
      <View className="gap-2">
        <AppText
          fontFamily="heading"
          className="text-foreground text-2xl text-center -tracking-wide"
        >
          When was your dog born?
        </AppText>
        <AppText
          weight="medium"
          className="text-foreground-secondary text-sm text-center"
        >
          Choose the closest month and year.
        </AppText>
      </View>

      <View className="gap-3">
        <AppText weight="bold" className="text-foreground-secondary text-xs">
          Month
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {MONTHS.map((month, index) => (
            <ChoicePill
              key={month}
              label={month}
              isSelected={selectedMonth === index}
              onPress={() => onSelectMonth(index)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <AppText weight="bold" className="text-foreground-secondary text-xs">
          Year
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-6">
            {years.map(year => (
              <ChoicePill
                key={year}
                label={String(year)}
                isSelected={selectedYear === year}
                onPress={() => onSelectYear(year)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function GenderStep({
  gender,
  onSelectGender,
}: {
  gender: Gender | null;
  onSelectGender: (gender: Gender) => void;
}) {
  return (
    <View className="gap-5">
      <View className="gap-2">
        <AppText
          fontFamily="heading"
          className="text-foreground text-2xl text-center -tracking-wide"
        >
          What&apos;s their gender?
        </AppText>
        <AppText
          weight="medium"
          className="text-foreground-secondary text-sm text-center"
        >
          Pick one for their profile.
        </AppText>
      </View>

      <View className="bg-overlay border border-border-soft rounded-3xl p-2 flex-row gap-2">
        <GenderOption
          label="Male"
          isSelected={gender === 'male'}
          onPress={() => onSelectGender('male')}
        />
        <GenderOption
          label="Female"
          isSelected={gender === 'female'}
          onPress={() => onSelectGender('female')}
        />
      </View>
    </View>
  );
}

function ChoicePill({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'min-w-16 items-center rounded-2xl border px-3.5 py-2.5',
        isSelected
          ? 'bg-primary border-primary'
          : 'bg-overlay border-border-soft',
      )}
    >
      <AppText
        className={cn(
          'text-sm font-extrabold',
          isSelected ? 'text-background' : 'text-foreground-secondary',
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function GenderOption({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 items-center rounded-2xl px-4 py-4',
        isSelected ? 'bg-primary' : 'bg-transparent',
      )}
    >
      <AppText
        className={cn(
          'text-base font-extrabold',
          isSelected ? 'text-background' : 'text-foreground-secondary',
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function makeDobEpoch(year: number, month: number) {
  return new Date(year, month, 1).getTime();
}
