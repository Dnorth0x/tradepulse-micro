import { beforeAll, vi } from "vitest";

// Mock React Native modules
vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: vi.fn((obj) => obj.ios || obj.default),
  },
  StyleSheet: {
    create: vi.fn((styles) => styles),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock Expo modules
vi.mock("expo-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  useLocalSearchParams: vi.fn(() => ({})),
}));

vi.mock("expo-haptics", () => ({
  notificationAsync: vi.fn(),
  NotificationFeedbackType: {
    Success: "success",
    Error: "error",
  },
}));

beforeAll(() => {
  // Setup global test environment
});