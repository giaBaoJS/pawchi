import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Rive, { type RiveRef } from 'rive-react-native';

export type DogAction = 'eat' | 'play' | 'sleep';

export interface DogAnimationRef {
  triggerAction: (action: DogAction) => void;
}

interface DogAnimationProps {
  mood: number;
  size?: number;
}

// The .riv file must be placed at: assets/animations/dogchi_character.riv
// State machine: DogStateMachine
// Inputs: mood (Number 0-100), action (Trigger): eat / play / sleep
export const DogAnimation = forwardRef<DogAnimationRef, DogAnimationProps>(
  function DogAnimation({ mood, size = 180 }, ref) {
    const riveRef = useRef<RiveRef>(null);

    useImperativeHandle(ref, () => ({
      triggerAction(action: DogAction) {
        riveRef.current?.fireState('DogStateMachine', action);
      },
    }));

    useEffect(() => {
      riveRef.current?.setInputState('DogStateMachine', 'mood', mood);
    }, [mood]);

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Rive
          ref={riveRef}
          resourceName="dogchi_character"
          stateMachineName="DogStateMachine"
          autoplay
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
