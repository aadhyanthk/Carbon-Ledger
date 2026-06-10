import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseActivity, getInsight, whatIf } from '../src/services/gemini.js';

// Mock the external API
const mockGenerateContent = vi.fn();
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent };
      }
    }
  };
});

globalThis.window = { showToast: vi.fn() };


describe('Gemini AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseActivity', () => {
    it('successfully parses a natural language string into activities', async () => {
      // Mocking a successful JSON response
      const mockResponseText = `[{"category": "transport", "label": "Drove to work", "kgCO2": 4.5}]`;
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockResponseText }
      });

      const result = await parseActivity("drove to work");
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('transport');
      expect(result[0].kgCO2).toBe(4.5);
    });

    it('handles markdown wrapped JSON responses', async () => {
      const mockResponseText = "```json\n[{\"category\": \"food\", \"label\": \"Beef burger\", \"kgCO2\": 5.0}]\n```";
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockResponseText }
      });

      const result = await parseActivity("had a burger");
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('food');
    });

    it('returns empty array on malformed JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Sorry, I do not understand' }
      });

      const result = await parseActivity("unknown text");
      expect(result).toBeNull();
    });

    it('returns null on API failure', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
      const result = await parseActivity("test");
      expect(result).toBeNull();
    });
  });

  describe('getInsight', () => {
    it('returns string insight from AI', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Great job keeping emissions low!' }
      });

      const result = await getInsight({
        totalKg: 10, budget: 15, topCategory: 'food', period: 'week', activities: []
      });
      expect(result).toBe('Great job keeping emissions low!');
    });
  });

  describe('whatIf', () => {
    it('parses scenario JSON correctly', async () => {
      const mockJson = `{"summary": "Big savings", "annualSavingKg": 100, "equivalent": "5 trees"}`;
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockJson }
      });

      const result = await whatIf("what if I walked?", { baseline: 15 });
      expect(result.summary).toBe('Big savings');
      expect(result.annualSavingKg).toBe(100);
    });
  });
});
