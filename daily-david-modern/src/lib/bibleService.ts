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
    // API.Bible API key for The Daily David app
    this.apiKey = apiKey || '580329b134bf13e4305a57695080195b';
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
      console.warn('No API key provided. Please get an API key from API.Bible to use real scripture data.');
      return null;
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
          content: this.cleanHtmlContent(data.data.content),
          copyright: data.data.copyright || 'Bible'
        };
      } else {
        console.error('API.Bible error:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching verse from API.Bible:', error);
      return null;
    }
  }

  // Search for verses
  async searchVerses(bibleId: string, query: string): Promise<BibleVerse[]> {
    if (!this.apiKey) {
      console.warn('No API key provided. Please get an API key from API.Bible to search scripture.');
      return [];
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
          content: this.cleanHtmlContent(verse.content),
          copyright: verse.copyright || 'Bible'
        })) || [];
      } else {
        console.error('API.Bible search error:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
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
    // Use a simple counter that increments each time to simulate different days
    const now = new Date();
    const timeBasedIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % 5; // Changes every day
    
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
      },
      'courage-joshua': {
        verses: [
          'JOS.1.9',           // Joshua 1:9 - Be strong and courageous
          'JOS.1.6',           // Joshua 1:6 - Be strong and courageous
          'JOS.1.7',           // Joshua 1:7 - Be strong and very courageous
          'JOS.1.8',           // Joshua 1:8 - Keep this Book of the Law
          'JOS.1.5'            // Joshua 1:5 - I will never leave you
        ],
        titles: [
          'Be Strong and Courageous',
          'God\'s Command to Joshua',
          'Very Courageous',
          'Meditate on God\'s Word',
          'God\'s Promise'
        ],
        themes: [
          'God\'s command to be strong and courageous in all circumstances',
          'The foundation of courage is trust in God\'s presence',
          'Courage comes from obedience to God\'s commands',
          'Strength comes from meditating on God\'s Word',
          'God\'s promise to never leave or forsake us'
        ]
      },
      'strength-isaiah': {
        verses: [
          'ISA.40.31',         // Isaiah 40:31 - Those who hope in the Lord
          'ISA.41.10',         // Isaiah 41:10 - Do not fear
          'ISA.43.2',          // Isaiah 43:2 - When you pass through waters
          'ISA.54.17',         // Isaiah 54:17 - No weapon formed against you
          'ISA.26.3'           // Isaiah 26:3 - Perfect peace
        ],
        titles: [
          'Renewed Strength',
          'Do Not Fear',
          'Through the Waters',
          'No Weapon Formed',
          'Perfect Peace'
        ],
        themes: [
          'Those who hope in the Lord will renew their strength',
          'God\'s command to not fear because He is with us',
          'God\'s promise to be with us through trials',
          'No weapon formed against us will prosper',
          'Perfect peace comes from trusting in God'
        ]
      }
    };

    const plan = devotionPlans[planId as keyof typeof devotionPlans];
    if (!plan) return null;

    const dayIndex = timeBasedIndex % plan.verses.length;
    const verseId = plan.verses[dayIndex];
    
    // Get the actual verse from API.Bible
    const verse = await this.getVerse(this.defaultBibleId, verseId);
    if (!verse) return null;

    return {
      date: now.toISOString().split('T')[0],
      verses: [verse],
      title: plan.titles[dayIndex],
      content: plan.themes[dayIndex]
    };
  }

  // Generate YouVersion deep link
  generateYouVersionLink(verseId: string): string {
    return `youversion://bible?reference=${verseId}`;
  }

  // Clean HTML content from API.Bible response
  private cleanHtmlContent(htmlContent: string): string {
    if (!htmlContent) return '';
    
    // Remove HTML tags and clean up the content
    let cleaned = htmlContent
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up verse numbers and formatting
      .replace(/\d+\s*/g, '')
      // Add spaces between sentences/verses
      .replace(/\.([A-Z])/g, '. $1')
      // Remove extra whitespace and normalize
      .replace(/\s+/g, ' ')
      .trim();
    
    // If the content is too short or empty, return the original
    if (cleaned.length < 10) {
      return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
    
    return cleaned;
  }
}

export const bibleService = new BibleService();
