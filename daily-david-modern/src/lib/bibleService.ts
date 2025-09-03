// Bible Service for integrating with API.Bible
// This will handle scripture retrieval and integration with SOAP study

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  abbreviation: string;
}

export interface BibleVerse {
  id: string;
  reference: string;
  content: string;
  copyright: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface DevotionDay {
  date: string;
  verses: BibleVerse[];
  title: string;
  content: string;
}

class BibleService {
  private apiKey: string;
  private baseUrl = 'https://api.scripture.api.bible/v1';
  private defaultBibleId = 'de4e12af7f28f599-02'; // ESV Bible ID

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  // Get available Bible versions
  async getBibleVersions(): Promise<BibleVersion[]> {
    if (!this.apiKey) {
      // Return mock data for demo
      return [
        { id: 'de4e12af7f28f599-02', name: 'English Standard Version', language: 'English', abbreviation: 'ESV' },
        { id: '65eec8e0b60e656b-01', name: 'New International Version', language: 'English', abbreviation: 'NIV' },
        { id: 'de4e12af7f28f599-01', name: 'King James Version', language: 'English', abbreviation: 'KJV' },
        { id: '65eec8e0b60e656b-02', name: 'New Living Translation', language: 'English', abbreviation: 'NLT' }
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/bibles`, {
        headers: { 'api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((bible: any) => ({
          id: bible.id,
          name: bible.name,
          language: bible.language?.name || 'Unknown',
          abbreviation: bible.abbreviation || bible.name.split(' ')[0]
        })) || [];
      }
    } catch (error) {
      console.error('Error fetching Bible versions:', error);
    }
    
    return [];
  }

  // Get a specific verse
  async getVerse(bibleId: string, verseId: string): Promise<BibleVerse | null> {
    if (!this.apiKey) {
      // Return mock data for demo
      return {
        id: verseId,
        reference: 'John 3:16',
        content: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
        copyright: 'ESV Bible'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/bibles/${bibleId}/verses/${verseId}`, {
        headers: { 'api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          id: data.data.id,
          reference: data.data.reference,
          content: data.data.content,
          copyright: data.data.copyright || 'Bible'
        };
      }
    } catch (error) {
      console.error('Error fetching verse:', error);
    }
    
    return null;
  }

  // Search for verses
  async searchVerses(bibleId: string, query: string): Promise<BibleVerse[]> {
    if (!this.apiKey) {
      // Return mock search results
      return [
        {
          id: 'JHN.3.16',
          reference: 'John 3:16',
          content: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
          copyright: 'ESV Bible'
        },
        {
          id: 'ROM.8.28',
          reference: 'Romans 8:28',
          content: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
          copyright: 'ESV Bible'
        }
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}`, {
        headers: { 'api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.verses?.map((verse: any) => ({
          id: verse.id,
          reference: verse.reference,
          content: verse.content,
          copyright: verse.copyright || 'Bible'
        })) || [];
      }
    } catch (error) {
      console.error('Error searching verses:', error);
    }
    
    return [];
  }

  // Get reading plans (Note: API.Bible doesn't provide reading plans)
  // This would need to be custom content or integration with other services
  async getReadingPlans(): Promise<ReadingPlan[]> {
    // API.Bible doesn't provide reading plans - this would be custom content
    // We can create our own manly devotional tracks using their scripture API
    return [
      {
        id: 'warrior-psalms',
        name: 'Warrior Psalms',
        description: '30 days of Psalms focused on strength, courage, and leadership',
        duration: 30
      },
      {
        id: 'leadership-proverbs',
        name: 'Leadership Proverbs',
        description: 'Daily wisdom from Proverbs for godly leadership',
        duration: 31
      },
      {
        id: 'courage-joshua',
        name: 'Courage & Conquest',
        description: 'Study Joshua and Judges for lessons in courage and faith',
        duration: 24
      },
      {
        id: 'strength-isaiah',
        name: 'Strength in Isaiah',
        description: 'Isaiah\'s messages of strength and hope for men',
        duration: 66
      }
    ];
  }

  // Get today's devotion from a custom reading plan
  async getTodaysDevotion(planId: string): Promise<DevotionDay | null> {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Custom manly devotional tracks using API.Bible scripture
    const devotionPlans = {
      'warrior-psalms': {
        verses: [
          'PSA.18.1-PSA.18.3', // Psalm 18:1-3 - Warrior's strength
          'PSA.27.1-PSA.27.3', // Psalm 27:1-3 - Courage
          'PSA.31.24',         // Psalm 31:24 - Be strong
          'PSA.46.1-PSA.46.3', // Psalm 46:1-3 - God our refuge
          'PSA.91.1-PSA.91.4'  // Psalm 91:1-4 - Protection
        ],
        titles: [
          'The Warrior\'s Strength',
          'Courage in Battle',
          'Stand Strong',
          'God Our Fortress',
          'Divine Protection'
        ],
        themes: [
          'Finding strength in God during spiritual battles',
          'Courage to face life\'s challenges with faith',
          'Standing firm in your convictions',
          'Trusting God as your ultimate refuge',
          'Resting in God\'s protection and care'
        ]
      },
      'leadership-proverbs': {
        verses: [
          'PRO.16.9',          // Proverbs 16:9 - Planning
          'PRO.27.17',         // Proverbs 27:17 - Iron sharpens iron
          'PRO.29.18',         // Proverbs 29:18 - Vision
          'PRO.31.8-PRO.31.9', // Proverbs 31:8-9 - Speak up
          'PRO.14.23'          // Proverbs 14:23 - Work
        ],
        titles: [
          'Divine Planning',
          'Iron Sharpens Iron',
          'Vision & Leadership',
          'Speak Up for Justice',
          'Diligent Work'
        ],
        themes: [
          'Planning your path while trusting God\'s direction',
          'The importance of godly friendships and accountability',
          'Leading with vision and purpose',
          'Using your voice to defend the vulnerable',
          'The value of hard work and diligence'
        ]
      }
    };

    const plan = devotionPlans[planId as keyof typeof devotionPlans];
    if (!plan) return null;

    const dayIndex = dayOfYear % plan.verses.length;
    const verseId = plan.verses[dayIndex];
    
    // Get the actual verse from API.Bible
    const verse = await this.getVerse(this.defaultBibleId, verseId);
    if (!verse) return null;

    return {
      date: today.toISOString().split('T')[0],
      verses: [verse],
      title: plan.titles[dayIndex],
      content: plan.themes[dayIndex]
    };
  }

  // Generate YouVersion deep link
  generateYouVersionLink(verseId: string): string {
    return `youversion://bible?reference=${verseId}`;
  }
}

export const bibleService = new BibleService();
