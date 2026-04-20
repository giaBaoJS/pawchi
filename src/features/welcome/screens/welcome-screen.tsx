import { Ionicons } from "@expo/vector-icons";
import { IconCard } from "@shared/components/ui/icon-card";
import { KawaiiButton } from "@shared/components/ui/kawaii-button";
import { KawaiiScreen } from "@shared/components/ui/kawaii-screen";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;
const apiKey = extra?.openaiApiKey;

const PILLS = [
  { icon: "paw" as const, label: "Breed ID" },
  { icon: "stats-chart" as const, label: "Stats" },
  { icon: "sparkles" as const, label: "Instant" },
];

function Pill({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.6)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,175,204,0.3)",
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={13} color={color} />
      <Text style={{ fontSize: 13, color, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const pillColor = useCSSVariable("--color-foreground-secondary") as string;

  return (
    <KawaiiScreen>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 32,
          paddingTop: 80,
          paddingBottom: 56,
        }}
      >
        {/* zero-height top item keeps hero in upper-center via space-between */}
        <View />

        {/* hero block */}
        <View style={{ alignItems: "center", gap: 28 }}>
          <IconCard icon="paw" size="lg" tone="primary" />

          <View style={{ alignItems: "center", gap: 10 }}>
            <Text
              style={{
                fontSize: 52,
                fontWeight: "800",
                color: "#5A4A54",
                letterSpacing: -1,
              }}
            >
              Pawchi
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#8B7A82",
                textAlign: "center",
                lineHeight: 24,
                fontWeight: "500",
              }}
            >
              Snap a photo,{"\n"}discover your dog&apos;s breed.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {PILLS.map((pill) => (
              <Pill
                key={pill.label}
                icon={pill.icon}
                label={pill.label}
                color={pillColor ?? "#8B7A82"}
              />
            ))}
          </View>
        </View>

        {/* CTA buttons */}
        <View style={{ width: "100%", gap: 12 }}>
          <KawaiiButton
            tone="primary"
            isDisabled={!apiKey}
            onPress={() => router.push("/scan")}
            label="Scan my dog"
            className="w-full"
          />
          <KawaiiButton
            tone="soft"
            onPress={() => router.replace("/home")}
            label="Skip for now"
            className="w-full"
          />

          {!apiKey && (
            <Text
              style={{
                color: "#FF8FAB",
                fontSize: 12,
                textAlign: "center",
                fontWeight: "500",
                paddingHorizontal: 16,
              }}
            >
              OpenAI API key not configured — add it to .env and rebuild
            </Text>
          )}
        </View>
      </View>
    </KawaiiScreen>
  );
}
